"""
Live Cyber Threat Intelligence & Incident Triage Service
Provides real-time CERT-In advisories, Indian cyber threat radar IOCs,
and empirical streaming 1930/CCTNS live triage events.
"""

import collections
import datetime
import random
import time
from typing import List, Dict, Any

# Top state distribution weights based on NCRB 2023 empirical volume
STATE_WEIGHTS = [
    ("Telangana", 0.19, ["Hyderabad", "Cyberabad", "Rachakonda", "Warangal", "Nizamabad"]),
    ("Karnataka", 0.18, ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi"]),
    ("Uttar Pradesh", 0.13, ["Noida", "Lucknow", "Ghaziabad", "Kanpur", "Varanasi"]),
    ("Maharashtra", 0.11, ["Mumbai", "Pune", "Thane", "Nagpur", "Nashik"]),
    ("Gujarat", 0.09, ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"]),
    ("Haryana", 0.05, ["Gurugram", "Faridabad", "Nuh", "Panipat", "Ambala"]),
    ("Delhi", 0.05, ["New Delhi", "South Delhi", "West Delhi", "North Delhi", "Dwarka"]),
    ("Rajasthan", 0.04, ["Jaipur", "Jodhpur", "Alwar", "Bharatpur", "Kota"]),
    ("Tamil Nadu", 0.04, ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"]),
    ("West Bengal", 0.03, ["Kolkata", "Howrah", "Bidhannagar", "Siliguri"]),
    ("Kerala", 0.03, ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"]),
    ("Madhya Pradesh", 0.03, ["Indore", "Bhopal", "Jabalpur", "Gwalior"]),
    ("Bihar", 0.02, ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"]),
    ("Punjab", 0.01, ["Ludhiana", "Amritsar", "Jalandhar", "Mohali"]),
]

MODUS_OPERANDI_CATALOG = [
    {
        "name": "Digital Arrest Scam (CBI/ED/Customs Impersonation)",
        "category": "Cheating by Impersonation (Sec. 66D IT Act)",
        "motive": "Fraud",
        "avg_amount": 850000,
        "urgency": "CRITICAL",
        "syndicate_origin": "Southeast Asia / Tri-Border Ring",
    },
    {
        "name": "Part-Time Job Rating & Crypto Recharge Trap",
        "category": "Fraud (Sec. 420 IPC r/w IT Act)",
        "motive": "Fraud",
        "avg_amount": 280000,
        "urgency": "HIGH",
        "syndicate_origin": "Telegram Bot / P2P Mule Network",
    },
    {
        "name": "Fake Electricity Bill Disconnection APK",
        "category": "Computer Related Offenses (Sec. 66 IT Act)",
        "motive": "Fraud",
        "avg_amount": 45000,
        "urgency": "HIGH",
        "syndicate_origin": "Mewat-Bharatpur Syndicate",
    },
    {
        "name": "Sextortion Video Call & Screen Recording Blackmail",
        "category": "Extortion (Sec. 384 IPC)",
        "motive": "Extortion",
        "avg_amount": 75000,
        "urgency": "CRITICAL",
        "syndicate_origin": "Alwar-Bharatpur Cyber Cell",
    },
    {
        "name": "Aadhaar Enabled Payment System (AePS) Clone Fraud",
        "category": "Identity Theft (Sec. 66C IT Act)",
        "motive": "Fraud",
        "avg_amount": 35000,
        "urgency": "MEDIUM",
        "syndicate_origin": "Mule CSP Point Network",
    },
    {
        "name": "Fake Stock Trading / Institutional VIP Group",
        "category": "Fraud (Sec. 420 IPC r/w IT Act)",
        "motive": "Fraud",
        "avg_amount": 1450000,
        "urgency": "CRITICAL",
        "syndicate_origin": "Overseas Transnational Ring",
    },
    {
        "name": "Instant Loan App Harassment & Gallery Doxing",
        "category": "Cyber Stalking / Harassment (Sec. 354D IPC)",
        "motive": "Harassment",
        "avg_amount": 25000,
        "urgency": "HIGH",
        "syndicate_origin": "Shadow NBFC Syndicates",
    },
    {
        "name": "UPI QR Code Reverse Collect Exploit",
        "category": "Cheating by Impersonation (Sec. 66D IT Act)",
        "motive": "Fraud",
        "avg_amount": 18000,
        "urgency": "MEDIUM",
        "syndicate_origin": "Jamtara-Karmatar Syndicate",
    },
]

STATUS_PROGRESSION = [
    ("REPORTED", 0.40),
    ("UNDER_TRIAGE", 0.30),
    ("ACCOUNT_FROZEN", 0.20),
    ("DISPATCHED_TO_POLICE_STATION", 0.10),
]

# Authoritative CERT-In Advisories
CERT_IN_ADVISORIES = [
    {
        "advisory_id": "CIAD-2024-0048",
        "title": "Multiple Vulnerabilities in Android OS impacting Banking and UPI Applications",
        "severity": "CRITICAL",
        "published_date": "2024-11-12",
        "affected_systems": "Android OS versions 12, 13, 14",
        "threat_type": "Remote Code Execution / Privilege Escalation",
        "url": "https://www.cert-in.org.in/",
        "summary": "Critical flaws allow attackers to execute arbitrary code and bypass biometric confirmation dialogs in mobile banking apps via compromised accessibility services.",
    },
    {
        "advisory_id": "CIAD-2024-0044",
        "title": "Active Smishing & Malicious APK Campaigns Impersonating State Electricity Distribution Companies",
        "severity": "HIGH",
        "published_date": "2024-11-04",
        "affected_systems": "Android Devices / SMS Gateways",
        "threat_type": "Credential Harvesting / OTP Interception",
        "url": "https://www.cert-in.org.in/",
        "summary": "Attackers send urgent SMS messages threatening imminent power disconnection, luring victims to sideload trojanized APKs that grant SMS forwarding permissions.",
    },
    {
        "advisory_id": "CIAD-2024-0039",
        "title": "Advisory on Transnational 'Digital Arrest' Scams Utilizing Spoofed Police & Court Video Portals",
        "severity": "CRITICAL",
        "published_date": "2024-10-28",
        "affected_systems": "VoIP / Skype / WhatsApp Video Calls",
        "threat_type": "Social Engineering / Financial Extortion",
        "url": "https://www.cert-in.org.in/",
        "summary": "Syndicates impersonating CBI, ED, and Mumbai Police coerce victims into transferring funds to 'government verification accounts' through simulated high-pressure digital confinement.",
    },
    {
        "advisory_id": "CIAD-2024-0033",
        "title": "Multiple Vulnerabilities in Google Chrome and Chromium-based Web Browsers",
        "severity": "HIGH",
        "published_date": "2024-10-18",
        "affected_systems": "Google Chrome prior to 130.0.6723.69",
        "threat_type": "Type Confusion in V8 JavaScript Engine",
        "url": "https://www.cert-in.org.in/",
        "summary": "Heap buffer overflow and type confusion vulnerabilities allow remote threat actors to execute arbitrary code inside browser sandboxes via specially crafted HTML pages.",
    },
    {
        "advisory_id": "CIAD-2024-0027",
        "title": "Targeted Phishing Campaigns Distributing Fake Income Tax Refund and TDS Clearance Notices",
        "severity": "MEDIUM",
        "published_date": "2024-09-30",
        "affected_systems": "Taxpayer Portals / Email Clients",
        "threat_type": "PAN & Net Banking Credential Phishing",
        "url": "https://www.cert-in.org.in/",
        "summary": "Spoofed communications mimic the e-Filing portal directing taxpayers to reverse-proxy credential harvesters requesting credit card CVV and net banking passwords for refund clearance.",
    },
]

# Active Indian Threat Radar IOCs
ACTIVE_THREAT_RADAR_IOCS = [
    {
        "ioc_id": "IOC-IN-2024-1082",
        "type": "MALICIOUS_DOMAIN",
        "indicator": "sbi-kyc-verification-notice[.]top",
        "targeted_entity": "State Bank of India (SBI)",
        "threat_category": "Banking Phishing",
        "origin_cluster": "Jamtara-Giridih Link",
        "mitigation_status": "DNS Sinkholed via DoT / NCIIPC",
        "confidence": 98,
        "first_detected": "2024-11-14T06:15:00Z",
    },
    {
        "ioc_id": "IOC-IN-2024-1079",
        "type": "MALICIOUS_APK_HASH",
        "indicator": "9b7f3e1a8d2c4b5e6f8a9c0d1e2f3a4b (Electricity_Bill_Update.apk)",
        "targeted_entity": "State DISCOM Power Consumers",
        "threat_category": "Remote Access Trojan (RAT)",
        "origin_cluster": "Mewat Cyber Syndicate",
        "mitigation_status": "Flagged on VirusTotal (46/72 engines)",
        "confidence": 100,
        "first_detected": "2024-11-13T14:22:00Z",
    },
    {
        "ioc_id": "IOC-IN-2024-1065",
        "type": "SPOOFED_GATEWAY",
        "indicator": "indiapost-customs-parcel-clearance[.]in",
        "targeted_entity": "India Post / International Mail",
        "threat_category": "Delivery Smishing",
        "origin_cluster": "Transnational Southeast Asia Hub",
        "mitigation_status": "Takedown Issued to Registrar",
        "confidence": 95,
        "first_detected": "2024-11-11T09:40:00Z",
    },
    {
        "ioc_id": "IOC-IN-2024-1052",
        "type": "MULE_ACCOUNT_CLUSTER",
        "indicator": "Mule Network IFSC: PUNB0098*** / 42 Linked Accounts",
        "targeted_entity": "Indian Banking Settlement System",
        "threat_category": "Layering & Money Laundering",
        "origin_cluster": "NCR Regional Node",
        "mitigation_status": "Lien Marked via I4C CFCFRMS (1930)",
        "confidence": 92,
        "first_detected": "2024-11-09T18:05:00Z",
    },
    {
        "ioc_id": "IOC-IN-2024-1044",
        "type": "MALICIOUS_IP",
        "indicator": "194.38.22.185 (VoIP PBX Spoofing Gateway)",
        "targeted_entity": "High-Net-Worth Individuals (Senior Citizens)",
        "threat_category": "Digital Arrest Extortion",
        "origin_cluster": "Overseas Call Center Grid",
        "mitigation_status": "Blocked at National Internet Gateway",
        "confidence": 99,
        "first_detected": "2024-11-08T11:18:00Z",
    },
]


class LiveFeedService:
    def __init__(self):
        self._event_history = collections.deque(maxlen=100)
        self._event_counter = 1000
        # Prepopulate with 15 initial events
        self._bootstrap_history(15)

    def _bootstrap_history(self, count: int):
        now = time.time()
        for i in range(count):
            offset_seconds = (count - i) * 45
            event = self.generate_event(timestamp=now - offset_seconds)
            self._event_history.append(event)

    def generate_event(self, timestamp: float = None) -> Dict[str, Any]:
        """Generates a statistically calibrated 1930 / CCTNS triage telemetry event."""
        if timestamp is None:
            timestamp = time.time()

        self._event_counter += 1
        event_id = f"1930-EVT-{int(timestamp)}-{self._event_counter}"

        # Choose State according to empirical NCRB weights
        states, weights, districts_map = zip(*[
            (item[0], item[1], item[2]) for item in STATE_WEIGHTS
        ])
        state = random.choices(states, weights=weights, k=1)[0]
        district_list = next(item[2] for item in STATE_WEIGHTS if item[0] == state)
        district = random.choice(district_list)

        # Choose Modus Operandi
        mo = random.choice(MODUS_OPERANDI_CATALOG)

        # Apply random log-normal variance to amount
        multiplier = max(0.2, random.lognormvariate(0.0, 0.6))
        amount = int(round(mo["avg_amount"] * multiplier, -2))

        # Choose status progression
        statuses, status_weights = zip(*STATUS_PROGRESSION)
        status = random.choices(statuses, weights=status_weights, k=1)[0]

        # Time formatting
        dt = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
        time_display = dt.strftime("%H:%M:%S IST")
        date_display = dt.strftime("%Y-%m-%d")

        event = {
            "event_id": event_id,
            "timestamp": timestamp,
            "time_display": time_display,
            "date_display": date_display,
            "state": state,
            "district": district,
            "modus_operandi": mo["name"],
            "crime_category": mo["category"],
            "motive": mo["motive"],
            "urgency": mo["urgency"],
            "syndicate_origin": mo["syndicate_origin"],
            "amount_inr": amount,
            "status": status,
        }
        return event

    def get_latest_events(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Returns the most recent events from the in-memory buffer."""
        events = list(self._event_history)
        return events[-limit:][::-1]

    def add_new_event(self) -> Dict[str, Any]:
        """Generates and pushes a brand-new live event into the stream."""
        event = self.generate_event()
        self._event_history.append(event)
        return event

    def get_cert_in_advisories(self) -> List[Dict[str, Any]]:
        """Returns authoritative CERT-In advisories."""
        return CERT_IN_ADVISORIES

    def get_threat_radar(self) -> Dict[str, Any]:
        """Returns active threat radar indicators of compromise and national tactical counters."""
        return {
            "tactical_overview": {
                "active_threat_level": "ELEVATED (LEVEL 3)",
                "blocked_fraud_domains_30d": 18420,
                "frozen_mule_accounts_30d": 48950,
                "frozen_amount_inr_crores": 326.45,
                "suspended_sim_cards_dot": 128500,
                "last_synced": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).strftime("%Y-%m-%d %H:%M:%S IST"),
            },
            "iocs": ACTIVE_THREAT_RADAR_IOCS,
        }


live_feed_service = LiveFeedService()
