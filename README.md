# Medipass EMR & Smart Consent System

Medipass is an enterprise-grade, secure Electronic Medical Record (EMR) application built with the premium aesthetic of Epic Systems, Apple Health, and Forward Health. It features a cutting-edge dark-mode glassmorphism UI, utilizing Framer Motion for micro-interactions, and empowers patients with absolute control over their medical data via cryptographic Smart Consent QR tokens.

---

## 🌟 How This Helps You (The Value Proposition)

**For the Patient:**
- **Zero Privacy Leaks:** You no longer have to hand over your entire medical history to every new doctor. You decide exactly which records to share (e.g., sharing only an allergy list with a dentist, but hiding your lab results).
- **Absolute Transparency:** The moment a doctor views your file, you receive an instant notification and it is permanently logged in your dashboard. You always know who is looking at your data.
- **The "Kill Switch":** If you lose trust or accidentally share a token, the "Revoke All Access" panic button instantly locks down your data, rendering all active QR codes completely useless.

**For the Medical Provider (Doctor):**
- **Instant Onboarding:** No more waiting for faxed records from previous hospitals. Scan a patient's QR code and instantly decrypt their critical history in seconds.
- **Reduced Liability:** By only receiving the data the patient explicitly consented to share, clinics reduce their HIPAA compliance footprint and data liability.
- **Scannable UI:** The premium dark-mode interface uses color-coding and pulse animations (like glowing red indicators for severe allergies) to ensure doctors notice life-saving information immediately.

---

## Supported Data Formats
The application utilizes a completely digitized, FHIR-inspired structure. Users do not upload static PDFs; instead, structured medical data is transmitted via **JSON** payloads to the backend API and stored in a NoSQL MongoDB database.

The primary resource formats handled by the system include:
1. **Prescriptions (Medications):** Dosage, frequency, active status, provider.
2. **Allergies:** Severity (triggering UI pulse alerts), reaction type, date diagnosed.
3. **Lab Reports (Vitals/Test Results):** Precise medical metrics stored and rendered with monospace precision typography.

---

## Comprehensive User Tutorial

### 🟢 PATIENT WORKFLOW: Managing & Sharing Your Health

**1. Onboarding & Dashboard Navigation**
- Log in to your Patient account.
- You are immediately greeted by the **3-Column Architecture Dashboard**. 
- The **Left Sidebar** provides instant, zero-load frontend filtering between your complete Medical History, active Medications, Lab Results, and Allergies.
- The **Stats Row** at the top aggregates your data in real-time, featuring counting animations and a glowing "Health Score" sparkline chart.

**2. Reviewing Your Data**
- Scroll through your medical records. You will notice color-coded indicators: Indigo for medications, Emerald for labs, and pulsing Red for severe allergies.
- Click on any specific record to **select** it. A glowing shield icon will appear on the right side of the card indicating it is selected for sharing.

**3. Generating a Smart Consent Token**
- Look to the **Right-Hand Panel (Smart Consent)**.
- If you have selected specific records, the panel will note that you are sharing a limited subset. If none are selected, it defaults to sharing your entire history.
- Click the glowing **Generate Secure Token** button.
- A secure QR Code is instantly generated on your screen, alongside a raw text token. This token is cryptographically signed and set to auto-expire in 10 minutes.

**4. Monitoring Security (New Features!)**
- **Notification Bell:** If a doctor successfully scans your QR code, a pulsing red dot appears on your notification bell. Click it to view the exact time and name of the doctor who accessed your file.
- **Recent Access Log:** On the main Dashboard tab, a widget continuously tracks the last person to view your records, ensuring a completely transparent audit trail.
- **The Panic Button:** If you accidentally generated a token or suspect unauthorized access, click the red **Revoke All Access** button in the consent panel. This instantly destroys all active tokens in the database.

---

### 🔵 DOCTOR WORKFLOW: Accessing Patient Data

**1. Authentication**
- Log in utilizing a secure Medical Provider account (Role: Doctor).

**2. The Doctor Dashboard**
- You are presented with a clean, focused, dark-mode interface designed purely for utility and speed.
- In the center of the screen is the **Token Entry / Scan Interface**.

**3. Scanning the Consent Token**
- When a patient physically shows you their phone, or reads you their raw token, enter it into the input field and click **Verify & Access Records**.
- The backend verifies the token's signature, checks if it has expired, and ensures it has not been revoked by the patient.

**4. Reviewing Granted Data**
- If valid, the patient's data decrypts and appears on your screen.
- **Crucially:** You will *only* see the specific records the patient granted you access to. If they only selected an Allergy record, the Prescriptions and Lab Results remain entirely hidden from your view.
- The moment you view this data, the backend logs your IP address and ID, pushing an instant notification to the patient's device to maintain absolute transparency.

---

## Future "Revolutionary" Roadmap
We are actively building toward the following Web3 and AI integrations:
- **Local AI RAG (Retrieval-Augmented Generation):** An on-device AI that allows patients to literally chat with their medical records to understand complex lab results without compromising privacy.
- **Zero-Knowledge Proofs (ZKPs):** Allowing patients to prove they are vaccinated or clear of a disease without revealing any underlying data.
- **Emergency NFC Protocol:** Paramedic tap-to-access for unconscious patients.

## Tech Stack Highlights
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, QR-Code generation.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, UUID tokenization.
- **Design System:** Epic Systems / Apple Health inspired deep dark mode (`#0D1117`), backdrop-blur glass surfaces, and `Plus Jakarta Sans` typography.
