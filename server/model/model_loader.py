from happytransformer import TTSettings, HappyTextToText

class ModelLoader:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("Loading the model...")
            cls._model = HappyTextToText(model_name="data/final-year-model")
        return cls._model
