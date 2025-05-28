# Forest Baseline Assessment: Lowland vs. Upland

## 1. Area Overview
- **Lowland Total Area:** 258,915 ha  
- **Upland Total Area:** 502,534 ha  

> According to the *Forest Management Plan* (MU451, 2021), these regions generally align with distinct landtypes:
> - **Petawawa Landtype (Lowland)**: Characterized by sandy outwash plains and jack pine, red pine, and black spruce ecosystems.
> - **Sherborne Landtype (Upland)**: Defined by glacial till moraines and hills with tolerant hardwood stands (e.g., sugar maple, beech) on upper slopes and conifers like spruce and cedar in low-lying areas.

---

## 2. Forest Cover (2000, Canadian Definition)

### GLAD Forest Cover (2000-2020)
| Region   | Total Area (ha) | Forest Area (ha) | Forest Cover (%) |
|----------|----------------|------------------|------------------|
| Lowland  | 258,915        | 241,656          | 93.3             |
| Upland   | 502,534        | 448,176          | 89.2             |

### Hansen Forest Cover (2000-2023)
| Region   | Total Area (ha) | Forest Area (ha) | Forest Cover (%) |
|----------|----------------|------------------|------------------|
| Lowland  | 258,915        | 241,742          | 93.4             |
| Upland   | 502,534        | 448,933          | 89.3             |

**Dataset Differences:**  
- **GLAD Dataset**: Uses GLCLUC2020 (Global Land Cover and Land Use Change) with a time period of 2000-2020. Provides consistent global land cover classification with 30m resolution.
- **Hansen Dataset**: Uses Global Forest Change dataset (v1.11) with a time period of 2000-2023. The forest cover is based on the year 2000 tree cover data as the baseline, with annual loss and gain updates through 2023. Focuses specifically on tree cover and forest change detection with annual updates.

**Interpretation:**  
Both regions are highly forested, but the Lowland has a slightly higher proportion of forest cover compared to the Upland, according to both datasets. The slight differences between datasets reflect their different methodologies and time periods.

---

## 3. Forest Loss

### GLAD Forest Loss (2000–2020)
| Region   | Forest Loss (ha) | Loss (% of total area) |
|----------|------------------|------------------------|
| Lowland  | 2,038            | 0.8                    |
| Upland   | 701              | 0.1                    |

### Hansen Forest Loss (2000–2023)
| Region   | Forest Loss (ha) | Loss (% of total area) |
|----------|------------------|------------------------|
| Lowland  | 19,078           | 7.4                    |
| Upland   | 5,495            | 1.1                    |

**Interpretation:**  
- The Lowland region has experienced a much higher absolute and relative forest loss than the Upland, especially according to the Hansen dataset.
- The difference between GLAD and Hansen loss estimates is notable, with Hansen reporting much higher loss in both regions, but especially in the Lowland.
- The extended time period of the Hansen dataset (3 additional years through 2023) accounts for some but not all of the difference, suggesting methodological differences in forest loss detection between the datasets.

> The FMP notes that areas in the Petawawa landtype are more accessible and historically subject to intensive forest management, including roads and clearcutting, which contributes to higher observed losses [1].

---

## 4. Forest Gain (2000–2020)

### GLAD Forest Gain (2000–2020)
| Region   | Forest Gain (ha) | Gain (% of total area) |
|----------|------------------|------------------------|
| Lowland  | 1,857            | 0.7                    |
| Upland   | 915              | 0.2                    |

**Interpretation:**  
- Forest gain is low in both regions, but the Lowland shows higher gain than the Upland.
- Gains are much smaller than losses, indicating a net decrease in forest area over the period.

**Note:**
> *Hansen gain data is not included in this summary. The Hansen gain layer only captures areas that transitioned from non-forest to forest between 2000 and 2012, and does not account for regrowth after loss or other types of forest recovery. This can lead to underestimation of true forest gain, and it is often omitted in scientific analyses for these reasons.*

> According to the FMP, **jack pine and red pine** in the Lowland are often managed using plantation systems that lead to relatively fast regrowth after harvest, partially explaining higher GLAD gains [2].

---

## 5. Key Findings
- **Forest cover is very high** in both regions, but slightly higher in the Lowland.
- **Forest loss is much greater in the Lowland** than in the Upland, both in absolute and relative terms.
- **Forest gain is minimal** in both regions and does not offset the loss.
- **The Lowland region is more dynamic**, with higher rates of both loss and gain, but a net loss overall.

---

## Summary Tables

### GLAD Dataset Summary (2000-2020)
| Region   | Total Area (ha) | Forest Cover (%) | Forest Loss (ha) | Forest Gain (ha) | Net Change (ha) |
|----------|----------------|------------------|------------------|------------------|-----------------|
| Lowland  | 258,915        | 93.3             | 2,038            | 1,857            | -181            |
| Upland   | 502,534        | 89.2             | 701              | 915              | +214            |

### Hansen Dataset Summary (2000-2023)
| Region   | Total Area (ha) | Forest Cover (%) | Forest Loss (ha) | Forest Gain* | Net Change* |
|----------|----------------|------------------|------------------|--------------|-------------|
| Lowland  | 258,915        | 93.4             | 19,078           | N/A          | N/A         |
| Upland   | 502,534        | 89.3             | 5,495            | N/A          | N/A         |

*Hansen gain data limited to 2000-2012 period and not included due to methodological limitations.

---

## Conclusions
- **Conservation efforts** may need to focus more on the Lowland region, where forest loss is higher.
- The **Upland region is more stable** in terms of forest cover and shows less change over the assessment period.
- The difference between GLAD and Hansen loss estimates suggests the need for further investigation into the causes and detection methods of forest change in these regions.
- **Management implications**: Sustain silvicultural success in the Lowland while ensuring preservation of stable hardwood ecosystems in the Upland.

---

*This summary is based on the analysis of `LowlandUpland_Forest_Stats.csv` generated from Google Earth Engine forest baseline assessment scripts, and contextualized using the Forest Management Plan MU451 (2021).*  

## References

[1] Ontario Ministry of Natural Resources and Forestry. (2021). Forest Management Plan for the Algonquin Park Forest Management Unit (MU451). Section 2.1.3: Landtype Associations and Forest Management History.

[2] Ontario Ministry of Natural Resources and Forestry. (2021). Forest Management Plan for the Algonquin Park Forest Management Unit (MU451). Section 3.2.1: Silvicultural Systems and Regeneration Strategies.
