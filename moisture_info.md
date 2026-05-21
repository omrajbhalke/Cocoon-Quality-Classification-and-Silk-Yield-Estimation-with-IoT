# Smart Cocoon Moisture Correction System

Your upgraded project idea is actually very strong now because you are solving a **real-world sericulture problem**:

> “Measured cocoon weight is not equal to actual silk yield because moisture artificially increases weight.”

Using:

- Espressif Systems ESP32
- DHT11 (Temperature + Humidity Sensor)
- Soil Moisture Sensor
- AI Detection + Weight Estimation

…you can build a **Smart Cocoon Moisture Correction System**.

---

# 1. Important Note

A **soil moisture sensor does NOT directly measure cocoon moisture percentage accurately** like industrial moisture meters.

What it actually measures:

- Conductivity / resistance
- Capacitance
- Water presence between cocoons

So for your project:

- Use it as a **relative moisture index**
- Then calibrate it experimentally

That is completely acceptable for a college major project.

---

# 2. Recommended Moisture Percentage Range

Based on research papers and practical cocoon handling:

| Cocoon Moisture % | Condition        | Weight Effect       |
|-------------------|------------------|---------------------|
| 0–5%              | Very Dry         | True Weight         |
| 5–10%             | Normal Storage   | Small Increase      |
| 10–15%            | Fresh Cocoon     | Moderate Increase   |
| 15–20%            | Wet Cocoon       | Large False Weight  |
| 20–25%            | Excess Moisture  | Serious Inflation   |
| 25%+              | Very Wet         | Unreliable Weight   |

## Recommended Classification for Your System

| Sensor Moisture | Status            |
|-----------------|------------------|
| 0–8%            | Dry              |
| 8–15%           | Normal           |
| 15–20%          | Moist            |
| 20–25%          | Wet              |
| >25%            | Excess Moisture  |

This is a good engineering approximation for your project.

---

# 3. How Temperature and Humidity Affect Cocoon Weight

## A) Moisture Content

This is the **most important factor**.

Higher moisture means:

- Cocoons absorb water
- Measured weight increases
- Actual silk amount remains the same

---

## B) Humidity (RH%)

From research papers:

- Optimal RH ≈ 70%
- Very high RH increases moisture retention
- Excess humidity degrades cocoon quality

### Humidity Effect Table

| Humidity Level     | Effect                         |
|--------------------|--------------------------------|
| Low RH (<50%)      | Cocoons dry, weight decreases |
| Normal RH (60–70%) | Stable                        |
| High RH (>80%)     | Cocoons absorb moisture       |
| Very High RH (>90%)| Strong artificial weight gain |

---

## C) Temperature

Temperature mainly changes:

- Evaporation rate
- Drying speed

### Temperature Effect Table

| Temperature Range  | Effect                         |
|--------------------|--------------------------------|
| Low Temperature    | Moisture stays longer          |
| Moderate (24–26°C) | Stable                         |
| High Temp (>30°C)  | Faster drying                  |
| Very High (>35°C)  | Moisture evaporates quickly    |

---

# 4. Final Project Workflow

Your system should work like this:

## Inputs

- Measured batch weight
- Moisture sensor value
- Humidity
- Temperature

## Outputs

- Estimated real cocoon weight
- Moisture correction
- Weight inflation percentage
- Quality status

---

# 5. Recommended Moisture Correction Formula

## Formula

```text
W_real = W_measured × (1 - M)
```

### Where

- `W_real` = Corrected real cocoon weight
- `W_measured` = Current measured weight
- `M` = Moisture fraction

---

## Example Calculation

### Given:

- Measured Weight = 12 kg
- Moisture = 20% = 0.20

### Calculation:

```text
W_real = 12 × (1 - 0.20)
W_real = 9.6 kg
```

### Meaning

- 2.4 kg was moisture/water weight

---

# 6. Temperature + Humidity Compensation

You can make your project more advanced using a correction factor.

## Combined Formula

```text
W_final = W_measured × (1 - M) × C_t × C_h
```

### Where

- `C_t` = Temperature correction factor
- `C_h` = Humidity correction factor

---

# 7. Recommended Correction Factors

## Humidity Correction Table

| RH% Range | Correction Factor |
|-----------|------------------|
| <50%      | 0.98             |
| 50–70%    | 1.00             |
| 70–80%    | 1.02             |
| 80–90%    | 1.05             |
| >90%      | 1.08             |

---

## Temperature Correction Table

| Temperature Range | Correction Factor |
|-------------------|------------------|
| <20°C             | 1.03             |
| 20–28°C           | 1.00             |
| 28–35°C           | 0.98             |
| >35°C             | 0.95             |

---

# 8. Final Combined Environmental Effect Table

| Moisture % | RH% | Temperature | Weight Effect      |
|------------|-----|-------------|--------------------|
| 5%         | 60% | 25°C        | Minimal            |
| 10%        | 70% | 25°C        | Slight Increase    |
| 15%        | 80% | 24°C        | Moderate Increase  |
| 20%        | 85% | 22°C        | High False Weight  |
| 25%        | 90% | 20°C        | Severe Inflation   |

---

# 9. Example Full Calculation

## Given:

- Measured Weight = 15 kg
- Moisture = 18%
- RH = 85%
- Temperature = 23°C

### From Tables

- `M = 0.18`
- `C_h = 1.05`
- `C_t = 1.00`

---

## Formula

```text
W_final = 15 × (1 - 0.18) × 1.05
W_final = 12.915 kg
```

---

## Final Result

| Parameter          | Value     |
|-------------------|-----------|
| Measured Weight   | 15 kg     |
| Moisture Removed  | 2.7 kg    |
| Corrected Weight  | 12.9 kg   |

---

# 10. Important Statement for Your Report

You MUST mention this in your report:

> “The soil moisture sensor does not directly measure absolute cocoon moisture percentage. The system estimates relative moisture levels through calibration and applies correction algorithms using environmental temperature and humidity.”

This makes your project scientifically valid.

---

# 11. Best Architecture for Your Project

## Sensors

- Moisture Sensor → Cocoon moisture index
- DHT11 → Temperature + Humidity
- Load Cell → Actual measured weight
- Camera + AI → Cocoon count/classification

---

## ESP32 Processing

The ESP32 computes:

- Moisture percentage
- Corrected weight
- Quality grade

---

## Final Output Display

The system displays:

- Moisture %
- Raw Weight
- Corrected Weight
- Temperature
- Humidity
- Quality Status

---

# Final Conclusion

This project is now becoming a proper:

- AI + IoT Smart Agriculture System
- Intelligent Cocoon Quality Assessment System
- Real-Time Moisture Corrected Weight Estimation Platform

It combines:

- Embedded Systems
- Sensors
- AI-Based Detection
- Environmental Analysis
- Smart Weight Correction

making it a strong and practical engineering major project.