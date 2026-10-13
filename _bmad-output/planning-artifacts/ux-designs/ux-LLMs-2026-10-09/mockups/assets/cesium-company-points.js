/* Snapshot de localizações demonstrativas do preview AA; não é cadastro geográfico verificado. */
const CESIUM_COMPANIES = [
  {
    "id": "openai",
    "name": "OpenAI",
    "city": "San Francisco, EUA",
    "lat": 37.7749,
    "lng": -122.4194,
    "layer": "lab",
    "tags": [],
    "site": "openai.com",
    "models": [
      "GPT-6",
      "GPT-6 mini",
      "o5"
    ]
  },
  {
    "id": "anthropic",
    "name": "Anthropic",
    "city": "San Francisco, EUA",
    "lat": 37.7897,
    "lng": -122.3972,
    "layer": "lab",
    "tags": [],
    "site": "anthropic.com",
    "models": [
      "Claude Opus 5.5",
      "Claude Sonnet 5.5",
      "Claude Haiku 5.5"
    ]
  },
  {
    "id": "google",
    "name": "Google (Alphabet)",
    "city": "Mountain View, EUA",
    "lat": 37.422,
    "lng": -122.0841,
    "layer": "lab",
    "tags": [
      "chip",
      "cloud"
    ],
    "site": "abc.xyz",
    "models": [
      "Gemini 3.5 Pro",
      "Gemini 3.5 Flash",
      "Gemma 4"
    ]
  },
  {
    "id": "apple",
    "name": "Apple",
    "city": "Cupertino, EUA",
    "lat": 37.3349,
    "lng": -122.009,
    "layer": "lab",
    "tags": [
      "chip"
    ],
    "site": "apple.com",
    "models": [
      "Apple Foundation Model 3"
    ]
  },
  {
    "id": "nvidia",
    "name": "NVIDIA",
    "city": "Santa Clara, EUA",
    "lat": 37.3708,
    "lng": -121.9637,
    "layer": "chip",
    "tags": [
      "soft",
      "lab"
    ],
    "site": "nvidia.com",
    "models": [
      "Nemotron 4 Ultra"
    ]
  },
  {
    "id": "microsoft",
    "name": "Microsoft",
    "city": "Redmond, EUA",
    "lat": 47.6396,
    "lng": -122.1281,
    "layer": "lab",
    "tags": [
      "cloud"
    ],
    "site": "microsoft.com",
    "models": [
      "MAI-2",
      "Phi-5"
    ]
  },
  {
    "id": "amazon",
    "name": "Amazon",
    "city": "Seattle, EUA",
    "lat": 47.6223,
    "lng": -122.3366,
    "layer": "cloud",
    "tags": [
      "lab",
      "chip"
    ],
    "site": "aboutamazon.com",
    "models": [
      "Nova 2 Premier"
    ]
  },
  {
    "id": "meta",
    "name": "Meta",
    "city": "Menlo Park, EUA",
    "lat": 37.4848,
    "lng": -122.1484,
    "layer": "lab",
    "tags": [],
    "site": "meta.com",
    "models": [
      "Llama 5"
    ]
  },
  {
    "id": "oracle",
    "name": "Oracle",
    "city": "Austin, EUA",
    "lat": 30.242,
    "lng": -97.72,
    "layer": "cloud",
    "tags": [],
    "site": "oracle.com",
    "models": []
  },
  {
    "id": "ibm",
    "name": "IBM",
    "city": "Armonk, EUA",
    "lat": 41.1084,
    "lng": -73.7203,
    "layer": "lab",
    "tags": [
      "cloud"
    ],
    "site": "ibm.com",
    "models": [
      "Granite 5"
    ]
  },
  {
    "id": "spacex",
    "name": "SpaceX (xAI)",
    "city": "Hawthorne, EUA",
    "lat": 33.9207,
    "lng": -118.328,
    "layer": "lab",
    "tags": [
      "cloud"
    ],
    "site": "spacex.com",
    "models": [
      "Grok 5",
      "Grok 5 mini"
    ]
  },
  {
    "id": "tesla",
    "name": "Tesla",
    "city": "Austin, EUA",
    "lat": 30.2218,
    "lng": -97.617,
    "layer": "soft",
    "tags": [
      "chip",
      "energy"
    ],
    "site": "tesla.com",
    "models": []
  },
  {
    "id": "broadcom",
    "name": "Broadcom",
    "city": "Palo Alto, EUA",
    "lat": 37.4142,
    "lng": -122.1497,
    "layer": "chip",
    "tags": [],
    "site": "broadcom.com",
    "models": []
  },
  {
    "id": "amd",
    "name": "AMD",
    "city": "Santa Clara, EUA",
    "lat": 37.383,
    "lng": -121.97,
    "layer": "chip",
    "tags": [],
    "site": "amd.com",
    "models": []
  },
  {
    "id": "micron",
    "name": "Micron",
    "city": "Boise, EUA",
    "lat": 43.528,
    "lng": -116.145,
    "layer": "chip",
    "tags": [],
    "site": "micron.com",
    "models": []
  },
  {
    "id": "tsmc",
    "name": "TSMC",
    "city": "Hsinchu, Taiwan",
    "lat": 24.7736,
    "lng": 121.0108,
    "layer": "chip",
    "tags": [],
    "site": "tsmc.com",
    "models": []
  },
  {
    "id": "asml",
    "name": "ASML",
    "city": "Veldhoven, Países Baixos",
    "lat": 51.4072,
    "lng": 5.4158,
    "layer": "chip",
    "tags": [],
    "site": "asml.com",
    "models": []
  },
  {
    "id": "skhynix",
    "name": "SK Hynix",
    "city": "Icheon, Coreia do Sul",
    "lat": 37.235,
    "lng": 127.492,
    "layer": "chip",
    "tags": [],
    "site": "skhynix.com",
    "models": []
  },
  {
    "id": "samsung",
    "name": "Samsung",
    "city": "Suwon, Coreia do Sul",
    "lat": 37.258,
    "lng": 127.046,
    "layer": "chip",
    "tags": [],
    "site": "samsung.com",
    "models": []
  },
  {
    "id": "alibaba",
    "name": "Alibaba",
    "city": "Hangzhou, China",
    "lat": 30.2741,
    "lng": 120.1551,
    "layer": "lab",
    "tags": [
      "cloud"
    ],
    "site": "alibabagroup.com",
    "models": [
      "Qwen 4",
      "Qwen 3.5",
      "Qwen3-Coder"
    ]
  },
  {
    "id": "baidu",
    "name": "Baidu",
    "city": "Pequim, China",
    "lat": 40.057,
    "lng": 116.307,
    "layer": "lab",
    "tags": [
      "cloud"
    ],
    "site": "baidu.com",
    "models": [
      "ERNIE 5"
    ]
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "city": "Hangzhou, China",
    "lat": 30.2085,
    "lng": 120.213,
    "layer": "lab",
    "tags": [],
    "site": "deepseek.com",
    "models": [
      "DeepSeek V4",
      "DeepSeek R3"
    ]
  },
  {
    "id": "moonshot",
    "name": "Moonshot AI",
    "city": "Pequim, China",
    "lat": 39.984,
    "lng": 116.307,
    "layer": "lab",
    "tags": [],
    "site": "moonshot.cn",
    "models": [
      "Kimi K3"
    ]
  },
  {
    "id": "zhipu",
    "name": "Zhipu AI",
    "city": "Pequim, China",
    "lat": 39.999,
    "lng": 116.33,
    "layer": "lab",
    "tags": [],
    "site": "zhipuai.cn",
    "models": [
      "GLM-5"
    ]
  },
  {
    "id": "mistral",
    "name": "Mistral AI",
    "city": "Paris, França",
    "lat": 48.8566,
    "lng": 2.3522,
    "layer": "lab",
    "tags": [],
    "site": "mistral.ai",
    "models": [
      "Mistral Large 3",
      "Ministral 3"
    ]
  },
  {
    "id": "coreweave",
    "name": "CoreWeave",
    "city": "Livingston, EUA",
    "lat": 40.796,
    "lng": -74.315,
    "layer": "cloud",
    "tags": [],
    "site": "coreweave.com",
    "models": []
  },
  {
    "id": "equinix",
    "name": "Equinix",
    "city": "Redwood City, EUA",
    "lat": 37.52,
    "lng": -122.26,
    "layer": "cloud",
    "tags": [],
    "site": "equinix.com",
    "models": []
  },
  {
    "id": "vertiv",
    "name": "Vertiv",
    "city": "Westerville, EUA",
    "lat": 40.1262,
    "lng": -82.9291,
    "layer": "cloud",
    "tags": [
      "energy"
    ],
    "site": "vertiv.com",
    "models": []
  },
  {
    "id": "arista",
    "name": "Arista",
    "city": "Santa Clara, EUA",
    "lat": 37.377,
    "lng": -121.922,
    "layer": "cloud",
    "tags": [],
    "site": "arista.com",
    "models": []
  },
  {
    "id": "constellation",
    "name": "Constellation Energy",
    "city": "Baltimore, EUA",
    "lat": 39.2904,
    "lng": -76.6122,
    "layer": "energy",
    "tags": [],
    "site": "constellationenergy.com",
    "models": []
  },
  {
    "id": "vistra",
    "name": "Vistra",
    "city": "Irving, EUA",
    "lat": 32.814,
    "lng": -96.9489,
    "layer": "energy",
    "tags": [],
    "site": "vistracorp.com",
    "models": []
  },
  {
    "id": "oklo",
    "name": "Oklo",
    "city": "Santa Clara, EUA",
    "lat": 37.35,
    "lng": -121.955,
    "layer": "energy",
    "tags": [],
    "site": "oklo.com",
    "models": []
  },
  {
    "id": "gevernova",
    "name": "GE Vernova",
    "city": "Cambridge, EUA",
    "lat": 42.3736,
    "lng": -71.1097,
    "layer": "energy",
    "tags": [],
    "site": "gevernova.com",
    "models": []
  },
  {
    "id": "nuscale",
    "name": "NuScale",
    "city": "Portland, EUA",
    "lat": 45.5152,
    "lng": -122.6784,
    "layer": "energy",
    "tags": [],
    "site": "nuscalepower.com",
    "models": []
  },
  {
    "id": "palantir",
    "name": "Palantir",
    "city": "Denver, EUA",
    "lat": 39.7392,
    "lng": -104.9903,
    "layer": "soft",
    "tags": [],
    "site": "palantir.com",
    "models": []
  }
];
