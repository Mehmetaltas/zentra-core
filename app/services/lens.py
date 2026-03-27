def get_lens_catalog():
    return [
        {
            "id": "sme",
            "name": "SME Lens",
            "focus": "Small and medium enterprise risk visibility",
            "status": "phase1_skeleton_active"
        },
        {
            "id": "invoice",
            "name": "Invoice Lens",
            "focus": "Invoice flow, delay, and receivable risk visibility",
            "status": "phase1_skeleton_active"
        },
        {
            "id": "logistics",
            "name": "Logistics Lens",
            "focus": "Shipment, delay, route, and logistics execution risk",
            "status": "phase1_skeleton_active"
        },
        {
            "id": "trade",
            "name": "Trade Lens",
            "focus": "Trade flow, counterparty, and execution layer visibility",
            "status": "phase1_skeleton_active"
        },
        {
            "id": "compliance",
            "name": "Compliance Lens",
            "focus": "Policy, rule, and control alignment visibility",
            "status": "phase1_skeleton_active"
        }
    ]

def get_lens_detail(lens_id: str):
    catalog = {
        "sme": {
            "id": "sme",
            "name": "SME Lens",
            "phase": "phase1",
            "status": "active_skeleton",
            "focus_areas": [
                "payment behavior",
                "cash pressure",
                "customer profile",
                "exposure visibility"
            ],
            "next_modules": [
                "sme cashflow signals",
                "sme repayment behavior",
                "sme partner dependency"
            ]
        },
        "invoice": {
            "id": "invoice",
            "name": "Invoice Lens",
            "phase": "phase1",
            "status": "active_skeleton",
            "focus_areas": [
                "invoice aging",
                "collection delay",
                "receivable concentration",
                "payment disruption"
            ],
            "next_modules": [
                "aging buckets",
                "invoice concentration",
                "debtor delay pattern"
            ]
        },
        "logistics": {
            "id": "logistics",
            "name": "Logistics Lens",
            "phase": "phase1",
            "status": "active_skeleton",
            "focus_areas": [
                "delivery delay",
                "route execution risk",
                "shipment dependency",
                "logistics stress visibility"
            ],
            "next_modules": [
                "route fragility",
                "carrier dependency",
                "cross-border delay map"
            ]
        },
        "trade": {
            "id": "trade",
            "name": "Trade Lens",
            "phase": "phase1",
            "status": "active_skeleton",
            "focus_areas": [
                "counterparty reliability",
                "trade execution continuity",
                "exposure clustering",
                "commercial disruption"
            ],
            "next_modules": [
                "counterparty graph",
                "trade chain mapping",
                "execution pressure scoring"
            ]
        },
        "compliance": {
            "id": "compliance",
            "name": "Compliance Lens",
            "phase": "phase1",
            "status": "active_skeleton",
            "focus_areas": [
                "rule alignment",
                "policy visibility",
                "internal control trace",
                "compliance pressure points"
            ],
            "next_modules": [
                "policy breach signals",
                "control rule mapping",
                "compliance event trace"
            ]
        }
    }

    return catalog.get(lens_id, {
        "id": lens_id,
        "status": "not_found"
    })
