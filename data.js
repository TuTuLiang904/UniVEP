window.UNIVEP_DATA = {
  "budgets": [
    1,
    2,
    4,
    8,
    10,
    16
  ],
  "models": {
    "star": {
      "name": "StarVLA",
      "series": {
        "v": [
          35.92,
          49.32,
          43.04,
          51.32,
          null,
          53.84
        ],
        "x": [
          40.52,
          41.52,
          42.8,
          42.16,
          null,
          42.52
        ],
        "xv": [
          55.56,
          59.6,
          58.02,
          58.32,
          null,
          59.96
        ],
        "u": [
          61.36,
          63.24,
          61.56,
          64.4,
          null,
          66.88
        ]
      },
      "note": "With one X-only evaluation, jointly trained UniVEP reaches 61.36%, above the strongest sixteen-step single-target result (59.96%). Main-table values report mean ± SD over three training seeds. Training uses 50 Clean demonstrations per task.",
      "sd": {
        "v": [
          0.82,
          2.94,
          0.24,
          1.12,
          null,
          2.54
        ],
        "x": [
          0.24,
          1.04,
          1.36,
          0.88,
          null,
          1.18
        ],
        "xv": [
          1.28,
          2.82,
          2.36,
          3.34,
          null,
          2.8
        ],
        "u": [
          0.26,
          0.98,
          2.42,
          2.36,
          null,
          2.32
        ]
      }
    },
    "lila": {
      "name": "LiLa-WAM Full",
      "series": {
        "v": [
          67.4,
          80.28,
          81.52,
          82.84,
          83.24,
          81.92
        ],
        "x": [
          73.36,
          72.52,
          73.88,
          74.48,
          75.04,
          75.32
        ],
        "xv": [
          80.12,
          82.68,
          82.08,
          82.56,
          83.48,
          82.6
        ],
        "ux": [
          75.64,
          82.36,
          85.6,
          84.64,
          83.72,
          84.48
        ],
        "u": [
          81.88,
          85.96,
          86.08,
          86.52,
          87.04,
          86.72
        ]
      },
      "note": "Two X-only evaluations reach 85.96%, above the strongest sixteen-step single-target result (82.60%). Main-table values report mean ± SD over three training seeds; the ten-call appendix values are shown without SD. Full training uses 50 Clean + 500 Randomized demonstrations per task.",
      "sd": {
        "v": [
          3.58,
          3.62,
          2.2,
          1.42,
          null,
          0.18
        ],
        "x": [
          2.88,
          2.36,
          1.72,
          0.32,
          null,
          2.64
        ],
        "xv": [
          2.22,
          0.6,
          3.36,
          0.44,
          null,
          2.86
        ],
        "ux": [
          2.36,
          1.64,
          0.58,
          0.66,
          null,
          1.02
        ],
        "u": [
          2.8,
          2.76,
          0.2,
          3.26,
          null,
          0.32
        ]
      }
    },
    "fast": {
      "name": "FastWAM",
      "series": {
        "v": [
          57.2,
          69.64,
          71.24,
          73.36,
          72.64,
          72.52
        ],
        "x": [
          59.64,
          61.76,
          62.8,
          65.64,
          65.72,
          66.92
        ],
        "xv": [
          32.64,
          34.24,
          35.64,
          35,
          34.96,
          35.48
        ],
        "u": [
          59.6,
          59.8,
          61.24,
          57.56,
          57,
          57.68
        ],
        "ux": [
          66.08,
          66.16,
          66.04,
          66.28,
          66.36,
          66.32
        ]
      },
      "note": "FastWAM is an important exception: velocity prediction remains strongest at larger budgets, while UniVEP–X improves on direct X. Its action pathway is coupled to a velocity-pretrained video model. Sweep and native-budget evaluations are separate."
    },
    "scratch": {
      "name": "FastWAM scratch",
      "series": {
        "v": [
          43.24,
          68.2,
          70.04,
          71.32,
          70.84,
          73.12
        ],
        "x": [
          65.68,
          66.52,
          69.5,
          67.48,
          68.2,
          68.96
        ],
        "xv": [
          60.84,
          59.64,
          62.2,
          63.12,
          64.4,
          65.12
        ],
        "u": [
          55.92,
          56.24,
          57.24,
          57.04,
          56.12,
          56.68
        ]
      },
      "note": "Removing action pretraining improves velocity-supervised endpoint prediction, revealing an interaction between prediction target and initialization. The video pathway retains its pretrained velocity objective."
    }
  },
  "provenance": {
    "source": "November 19 manuscript, main NFE table and appendix sweeps",
    "evaluation": "RoboTwin Clean, equal-weight mean across 50 tasks",
    "uncertainty": "45 StarVLA/LiLa-WAM main-table values include standard deviations across three training seeds; no SD is inferred for other measurements."
  },
  "realRobot": {
    "tasks": [
      {
        "id": "drawer",
        "name": "Drawer Cube Place"
      },
      {
        "id": "pick",
        "name": "Pick Two Cube"
      },
      {
        "id": "stick",
        "name": "Grab Stick"
      },
      {
        "id": "mean",
        "name": "Mean across tasks"
      }
    ],
    "series": {
      "v": [
        24,
        32,
        38,
        31.33
      ],
      "x": [
        34,
        34,
        46,
        38
      ],
      "xv": [
        38,
        34,
        76,
        49.33
      ],
      "u": [
        52,
        40,
        84,
        58.67
      ]
    },
    "provenance": "November 19 manuscript real-robot evaluation. One multitask policy per recipe, identical four-call StarVLA controller, 50 trials per task.",
    "evaluationNFE": 4
  },
  "efficiency": {
    "policy": "LiLa-WAM Full",
    "baseline": {
      "recipe": "X–V",
      "nfe": 16,
      "success": 82.6,
      "latencyMs": 100.98
    },
    "univep": {
      "nfe": 2,
      "success": 85.96,
      "latencyMs": 23.16
    },
    "successGainPp": 3.36,
    "latencyReductionPercent": 77.1
  }
};
