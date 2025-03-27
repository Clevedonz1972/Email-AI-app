from enum import Enum
from typing import Optional


class ProviderType(Enum):
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    IMAP = "imap"


class EmailProviderFactory:
    @staticmethod
    def create_provider(provider_type: ProviderType, config: dict):
        if provider_type == ProviderType.GMAIL:
            return GmailProvider(config)
        elif provider_type == ProviderType.OUTLOOK:
            return OutlookProvider(config)
        elif provider_type == ProviderType.IMAP:
            return IMAPProvider(config)
