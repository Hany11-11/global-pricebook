package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.PricebookDTO;
import com.pricebookCalculator.assessment.dto.PricebookDTO.YearlyRateDTO;
import com.pricebookCalculator.assessment.entity.Country;
import com.pricebookCalculator.assessment.entity.Pricebook;
import com.pricebookCalculator.assessment.entity.PricebookRate;
import com.pricebookCalculator.assessment.entity.RateType;
import com.pricebookCalculator.assessment.repository.CountryRepository;
import com.pricebookCalculator.assessment.repository.PricebookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PricebookServiceImpl implements PricebookService {

    @Autowired
    private PricebookRepository pricebookRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Override
    public PricebookDTO getPricebookByCountryId(Long countryId) {
        Optional<Country> countryOpt = countryRepository.findById(countryId);
        if (countryOpt.isEmpty()) {
            return new PricebookDTO(countryId, new ArrayList<>(), new HashMap<>(), new HashMap<>(),
                    new HashMap<>(), new HashMap<>(), new HashMap<>(), new HashMap<>());
        }

        Optional<Pricebook> pricebookOpt = pricebookRepository.findByCountryId(countryId);
        if (pricebookOpt.isEmpty()) {
            return new PricebookDTO(countryId, new ArrayList<>(), new HashMap<>(), new HashMap<>(),
                    new HashMap<>(), new HashMap<>(), new HashMap<>(), new HashMap<>());
        }

        Pricebook pricebook = pricebookOpt.get();
        return convertToDTO(pricebook);
    }

    @Override
    @Transactional
    public PricebookDTO savePricebook(PricebookDTO dto) {
        Country country = countryRepository.findById(dto.getCountryId())
                .orElseThrow(() -> new IllegalArgumentException("Country not found with ID: " + dto.getCountryId()));

        Pricebook pricebook = pricebookRepository.findByCountryId(dto.getCountryId())
                .orElseGet(() -> {
                    Pricebook pb = new Pricebook();
                    pb.setCountry(country);
                    pb.setRates(new ArrayList<>());
                    return pb;
                });

        generateRates(dto);
        pricebook.getRates().clear();

        List<PricebookRate> newRates = new ArrayList<>();

        if (dto.getYearlyRates() != null) {
            for (YearlyRateDTO yr : dto.getYearlyRates()) {
                if (yr.getWithBackfill() != null) {
                    newRates.add(new PricebookRate(null, pricebook, RateType.BACKFILL, yr.getLevel(), yr.getWithBackfill()));
                }
                if (yr.getWithoutBackfill() != null) {
                    newRates.add(new PricebookRate(null, pricebook, RateType.WITHOUT_BACKFILL, yr.getLevel(), yr.getWithoutBackfill()));
                }
            }
        }

        addRatesFromMap(dto.getFullDayVisit(), pricebook, RateType.FULL_DAY, newRates);
        addRatesFromMap(dto.getHalfDayVisit(), pricebook, RateType.HALF_DAY, newRates);
        addRatesFromMap(dto.getDispatchRates(), pricebook, RateType.DISPATCH, newRates);
        addRatesFromMap(dto.getImacDispatch(), pricebook, RateType.IMAC, newRates);
        addRatesFromMap(dto.getShortTermProjects(), pricebook, RateType.SHORT_TERM, newRates);
        addRatesFromMap(dto.getLongTermProjects(), pricebook, RateType.LONG_TERM, newRates);

        pricebook.getRates().addAll(newRates);

        Pricebook savedPricebook = pricebookRepository.save(pricebook);
        return convertToDTO(savedPricebook);
    }

    @Override
    public PricebookDTO generatePricebookPreview(PricebookDTO dto) {
        generateRates(dto);
        return dto;
    }

    private void addRatesFromMap(Map<String, Double> map, Pricebook pricebook, RateType rateType, List<PricebookRate> list) {
        if (map != null) {
            for (Map.Entry<String, Double> entry : map.entrySet()) {
                if (entry.getValue() != null) {
                    list.add(new PricebookRate(null, pricebook, rateType, entry.getKey(), entry.getValue()));
                }
            }
        }
    }

    private void generateRates(PricebookDTO dto) {
        double l1Backfill = 0.0;
        if (dto.getYearlyRates() != null) {
            for (YearlyRateDTO yr : dto.getYearlyRates()) {
                if ("L1".equalsIgnoreCase(yr.getLevel())) {
                    l1Backfill = yr.getWithBackfill() != null ? yr.getWithBackfill() : 0.0;
                    break;
                }
            }
        }

        double l1WithoutBackfill = l1Backfill * 1.125;
        double l2Backfill = l1Backfill * 1.15;
        double l2WithoutBackfill = l2Backfill * 1.125;
        double l3Backfill = l2Backfill * 1.15;
        double l3WithoutBackfill = l3Backfill * 1.125;
        double l4Backfill = l3WithoutBackfill;
        double l4WithoutBackfill = l4Backfill * 1.15;
        double l5Backfill = l4WithoutBackfill;
        double l5WithoutBackfill = l5Backfill * 1.15;

        List<YearlyRateDTO> generatedYearly = new ArrayList<>();
        generatedYearly.add(new YearlyRateDTO("L1", l1Backfill, l1WithoutBackfill));
        generatedYearly.add(new YearlyRateDTO("L2", l2Backfill, l2WithoutBackfill));
        generatedYearly.add(new YearlyRateDTO("L3", l3Backfill, l3WithoutBackfill));
        generatedYearly.add(new YearlyRateDTO("L4", l4Backfill, l4WithoutBackfill));
        generatedYearly.add(new YearlyRateDTO("L5", l5Backfill, l5WithoutBackfill));
        dto.setYearlyRates(generatedYearly);

        Map<String, Double> fd = dto.getFullDayVisit() != null ? dto.getFullDayVisit() : new HashMap<>();
        double fdL1 = fd.getOrDefault("L1", 0.0);
        double fdL2 = fd.getOrDefault("L2", 0.0);
        double fdL3 = fdL2 + (fdL2 * 0.12);
        fd.put("L1", fdL1);
        fd.put("L2", fdL2);
        fd.put("L3", fdL3);
        dto.setFullDayVisit(fd);

        Map<String, Double> hd = new HashMap<>();
        hd.put("L1", fdL1 * 0.75);
        hd.put("L2", fdL2 * 0.75);
        hd.put("L3", fdL3 * 0.75);
        dto.setHalfDayVisit(hd);

        Map<String, Double> disp = dto.getDispatchRates() != null ? dto.getDispatchRates() : new HashMap<>();
        double sbd = disp.getOrDefault("SBD", 0.0);
        double addHour = disp.getOrDefault("Additional Hour Rate", 0.0);

        double rate24x7 = sbd * 1.20;
        double rate9x5 = rate24x7 * 0.75;
        double nbd = sbd * 0.75;
        double db2 = nbd - (nbd * 0.10);
        double db3 = db2 - (db2 * 0.02);

        disp.put("SBD", sbd);
        disp.put("Additional Hour Rate", addHour);
        disp.put("24x7x4", rate24x7);
        disp.put("9x5x4", rate9x5);
        disp.put("NBD", nbd);
        disp.put("2BD", db2);
        disp.put("3BD", db3);
        dto.setDispatchRates(disp);

        Map<String, Double> imac = dto.getImacDispatch() != null ? dto.getImacDispatch() : new HashMap<>();
        double imac2bd = imac.getOrDefault("2BD", 0.0);
        double imac3bd = db3;
        double imac4bd = imac3bd - (imac3bd * 0.02);

        imac.put("2BD", imac2bd);
        imac.put("3BD", imac3bd);
        imac.put("4BD", imac4bd);
        dto.setImacDispatch(imac);

        Map<String, Double> st = new HashMap<>();
        st.put("L1", l1Backfill / 7.5);
        st.put("L2", l2Backfill / 7.5);
        st.put("L3", l3Backfill / 7.5);
        st.put("L4", l4Backfill / 8.0);
        st.put("L5", l5Backfill / 8.0);
        dto.setShortTermProjects(st);

        Map<String, Double> lt = new HashMap<>();
        lt.put("L1", l1Backfill / 8.0);
        lt.put("L2", l2Backfill / 8.0);
        lt.put("L3", l3Backfill / 8.0);
        lt.put("L4", l4Backfill / 8.0);
        lt.put("L5", l5Backfill / 8.0);
        dto.setLongTermProjects(lt);
    }

    private PricebookDTO convertToDTO(Pricebook pricebook) {
        PricebookDTO dto = new PricebookDTO();
        dto.setCountryId(pricebook.getCountry().getId());

        List<YearlyRateDTO> yearly = new ArrayList<>();
        Map<String, Double> fd = new HashMap<>();
        Map<String, Double> hd = new HashMap<>();
        Map<String, Double> disp = new HashMap<>();
        Map<String, Double> imac = new HashMap<>();
        Map<String, Double> st = new HashMap<>();
        Map<String, Double> lt = new HashMap<>();

        Map<String, Double> backfillRates = new HashMap<>();
        Map<String, Double> withoutBackfillRates = new HashMap<>();

        for (PricebookRate rate : pricebook.getRates()) {
            switch (rate.getRateType()) {
                case BACKFILL:
                    backfillRates.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case WITHOUT_BACKFILL:
                    withoutBackfillRates.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case FULL_DAY:
                    fd.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case HALF_DAY:
                    hd.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case DISPATCH:
                    disp.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case IMAC:
                    imac.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case SHORT_TERM:
                    st.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
                case LONG_TERM:
                    lt.put(rate.getLevelOrSla(), rate.getPrice());
                    break;
            }
        }

        Set<String> allLevels = new HashSet<>();
        allLevels.addAll(backfillRates.keySet());
        allLevels.addAll(withoutBackfillRates.keySet());
        if (allLevels.isEmpty()) {
            allLevels.addAll(Arrays.asList("L1", "L2", "L3", "L4", "L5"));
        }

        for (String lvl : allLevels) {
            yearly.add(new YearlyRateDTO(
                    lvl,
                    backfillRates.get(lvl),
                    withoutBackfillRates.get(lvl)
            ));
        }

        yearly.sort(Comparator.comparing(YearlyRateDTO::getLevel));

        dto.setYearlyRates(yearly);
        dto.setFullDayVisit(fd);
        dto.setHalfDayVisit(hd);
        dto.setDispatchRates(disp);
        dto.setImacDispatch(imac);
        dto.setShortTermProjects(st);
        dto.setLongTermProjects(lt);

        return dto;
    }
}
