from abc import ABC, abstractmethod


class Tool(ABC):

    def __init__(self, name, description):
        self.name = name
        self.description = description

    @abstractmethod
    def execute(self, **kwargs):
        pass