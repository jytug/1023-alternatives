class Settings:
    def __init__(self, timeout=5000, mode='const', feedback=False):
        self.timeout = timeout
        self.mode = mode
        self.feedback = feedback

    def setTimeout(self, timeout):
        self.timeout = timeout
        return self

    def setMode(self, mode):
        self.mode = mode
        return self

    def setFeedback(self, feedback):
        self.feedback = feedback
        return self

    def __repr__(self):
        return str(self.__dict__)

    def __str__(self):
        return str(self.__dict__)

    def __iter__(self):
        yield 'timeout', self.timeout
        yield 'mode', self.mode
        yield 'feedback', self.feedback
