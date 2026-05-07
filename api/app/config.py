from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    elasticsearch_url: str
    elasticsearch_api_key: str

    # ── Sustainability model parameters ──────────────────────────────────────
    # All values are research-backed defaults; override via env for your region.
    #
    # Sources:
    #   [1] Patterson et al. (2021). Carbon Emissions and Large Neural Network
    #       Training. arXiv:2104.10350
    #   [2] IEA (2024). Electricity 2024. World avg grid intensity: 386 gCO₂/kWh
    #   [3] Lannelongue et al. (2021). Green Algorithms. Adv Sci.
    #       doi:10.1002/advs.202100707
    #   [4] Dodge et al. (2022). Measuring the Carbon Intensity of AI in
    #       Cloud Instances. FAccT 2022.

    # Grid carbon intensity in gCO₂eq/kWh — IEA 2024 world average [2]
    # Regional examples: US=386, EU=276, France=56, India=708, China=581
    grid_carbon_g_per_kwh: float = 386.0

    # Energy consumed per million tokens of LLM inference on A100 GPU [1][4]
    # Range across model sizes: 0.4–3.0 kWh/M tokens; 1.34 = GPT-3-scale
    gpu_kwh_per_million_tokens: float = 1.34

    # System overhead factor (cooling, idle power, networking) [3]
    inference_overhead_factor: float = 1.2

    # Average tokens per word for BPE tokenizers (OpenAI tiktoken empirical avg)
    tokens_per_word: float = 1.3

    # Confidence interval half-width as a fraction of point estimate (±30%)
    # Reflects model uncertainty per Lannelongue et al. [3]
    uncertainty_fraction: float = 0.30

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
