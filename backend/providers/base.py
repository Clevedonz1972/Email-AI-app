from abc import ABC, abstractmethod
from typing import List, Dict

class EmailProvider(ABC):
    @abstractmethod
    async def connect(self) -> bool:
        pass

    @abstractmethod
    async def get_messages(self, folder: str, limit: int = 50) -> List[Dict]:
        pass

    @abstractmethod
    async def send_message(self, to: List[str], subject: str, body: str) -> bool:
        pass 