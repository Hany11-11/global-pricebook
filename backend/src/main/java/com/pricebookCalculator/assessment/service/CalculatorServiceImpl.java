package com.pricebookCalculator.assessment.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pricebookCalculator.assessment.dto.CalculateRequestDTO;
import com.pricebookCalculator.assessment.dto.CalculateResponseDTO;
import com.pricebookCalculator.assessment.entity.Country;
import com.pricebookCalculator.assessment.entity.Pricebook;
import com.pricebookCalculator.assessment.entity.PricebookRate;
import com.pricebookCalculator.assessment.entity.RateType;
import com.pricebookCalculator.assessment.entity.Term;
import com.pricebookCalculator.assessment.repository.CountryRepository;
import com.pricebookCalculator.assessment.repository.PricebookRepository;
import com.pricebookCalculator.assessment.repository.TermRepository;

@Service
public class CalculatorServiceImpl implements CalculatorService {

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private PricebookRepository pricebookRepository;

    @Autowired
    private TermRepository termRepository;

    @Override
    public CalculateResponseDTO calculate(CalculateRequestDTO request) {
        String service = request.getService();
        Map<String, String> inputs = request.getInputs();

        Optional<Country> countryOpt = findCountry(request.getCountry());
        Country country = countryOpt.orElseThrow(() ->
            new IllegalArgumentException("Selected country was not found in database."));

        String countryName = country.getName();
        String currencyCode = country.getCurrency();
        String currencySymbol = country.getCurrencySymbol();

        double surchargeRate = 0.05;
        double travelThreshold = 50.0;
        double travelRate = 0.40;
        double oohMultiplier = 1.5;
        double weekendMultiplier = 2.0;

        List<Term> terms = termRepository.findAll();
        for (Term term : terms) {
            if (term.getRuleType() != null) {
                switch (term.getRuleType()) {
                    case PERCENTAGE_SURCHARGE:
                        surchargeRate = term.getChargeValue() != null ? term.getChargeValue() : surchargeRate;
                        break;
                    case TRAVEL_DISTANCE:
                        travelThreshold = term.getThresholdValue() != null ? term.getThresholdValue() : travelThreshold;
                        travelRate = term.getChargeValue() != null ? term.getChargeValue() : travelRate;
                        break;
                    case MULTIPLIER_OOH:
                        oohMultiplier = term.getChargeValue() != null ? term.getChargeValue() : oohMultiplier;
                        break;
                    case MULTIPLIER_WEEKEND:
                        weekendMultiplier = term.getChargeValue() != null ? term.getChargeValue() : weekendMultiplier;
                        break;
                    default:
                        break;
                }
            }
        }

        Pricebook pricebook = pricebookRepository.findByCountryId(country.getId())
                .orElseThrow(() -> new IllegalStateException("No pricebook configured for selected country."));

        RateType rateType = determineRateType(service, inputs);
        String levelOrSla = determineLevelOrSla(service, inputs);

        PricebookRate selectedRate = pricebook.getRates().stream()
                .filter(r -> r.getRateType() == rateType && r.getLevelOrSla().equalsIgnoreCase(levelOrSla))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No price configured in database for selected service and level/SLA."));

        double basePrice = selectedRate.getPrice();

        boolean applyFee = "Yes".equalsIgnoreCase(inputs.get("Apply Fee"));
        double serviceFee = applyFee ? basePrice * surchargeRate : 0.0;

        double travelDistance = 0.0;
        String travelDistStr = inputs.get("Travel Distance");
        if (travelDistStr != null && !travelDistStr.trim().isEmpty()) {
            try {
                travelDistance = Double.parseDouble(travelDistStr);
            } catch (NumberFormatException e) {
                // ignored
            }
        }
        double travelCharge = travelDistance > travelThreshold ? (travelDistance - travelThreshold) * travelRate : 0.0;

        double supportMultiplier = 1.0;
        String timing = inputs.get("Support Timing");
        if (timing != null) {
            if (timing.toLowerCase().contains("out of hours")) {
                supportMultiplier = oohMultiplier;
            } else if (timing.toLowerCase().contains("weekend") || timing.toLowerCase().contains("holiday")) {
                supportMultiplier = weekendMultiplier;
            }
        }

        double finalPrice = (basePrice + serviceFee + travelCharge) * supportMultiplier;

        String selection = "";
        if ("Yearly Rates".equalsIgnoreCase(service)) {
            selection = inputs.getOrDefault("Level", "L3") + " - " + inputs.getOrDefault("Backfill Type", "With Backfill");
        } else if ("Dispatch Rates".equalsIgnoreCase(service) || "IMAC Dispatch".equalsIgnoreCase(service)) {
            selection = inputs.getOrDefault("SLA", "SBD");
        } else {
            selection = inputs.getOrDefault("Level", "L3");
        }

        CalculateResponseDTO response = new CalculateResponseDTO();
        response.setRegion(request.getRegion());
        response.setCountry(countryName);
        response.setService(service);
        response.setSelection(selection);
        response.setCurrency(currencyCode);
        response.setSymbol(currencySymbol);
        response.setBasePrice(String.format(Locale.US, "%,.2f", basePrice));
        response.setServiceFee(String.format(Locale.US, "%,.2f", serviceFee));
        response.setTravelCharge(String.format(Locale.US, "%,.2f", travelCharge));
        response.setSupportMultiplier(String.format(Locale.US, "%.1fx", supportMultiplier));
        response.setFinalPrice(String.format(Locale.US, "%,.2f", finalPrice));

        return response;
    }

    private Optional<Country> findCountry(String countryStr) {
        if (countryStr == null || countryStr.trim().isEmpty()) {
            return Optional.empty();
        }
        try {
            Long id = Long.parseLong(countryStr);
            return countryRepository.findById(id);
        } catch (NumberFormatException e) {
            return countryRepository.findAll().stream()
                    .filter(c -> c.getName().equalsIgnoreCase(countryStr))
                    .findFirst();
        }
    }

    private RateType determineRateType(String service, Map<String, String> inputs) {
        if ("Yearly Rates".equalsIgnoreCase(service)) {
            String backfill = inputs.getOrDefault("Backfill Type", "With Backfill");
            return "With Backfill".equalsIgnoreCase(backfill) ? RateType.BACKFILL : RateType.WITHOUT_BACKFILL;
        } else if ("Full Day Visit".equalsIgnoreCase(service)) {
            return RateType.FULL_DAY;
        } else if ("Half Day Visit".equalsIgnoreCase(service)) {
            return RateType.HALF_DAY;
        } else if ("Dispatch Rates".equalsIgnoreCase(service)) {
            return RateType.DISPATCH;
        } else if ("IMAC Dispatch".equalsIgnoreCase(service)) {
            return RateType.IMAC;
        } else if ("Short-Term Projects".equalsIgnoreCase(service)) {
            return RateType.SHORT_TERM;
        } else if ("Long-Term Projects".equalsIgnoreCase(service)) {
            return RateType.LONG_TERM;
        }
        return RateType.BACKFILL;
    }

    private String determineLevelOrSla(String service, Map<String, String> inputs) {
        if ("Dispatch Rates".equalsIgnoreCase(service) || "IMAC Dispatch".equalsIgnoreCase(service)) {
            return inputs.getOrDefault("SLA", "SBD");
        }
        return inputs.getOrDefault("Level", "L3");
    }

}
