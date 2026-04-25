"""
Compatibility entry point for the Cravify production E2E flow.

New framework files:
- config.py
- utils.py
- test_master_flow.py
- test_cross_browser.py
"""

from test_master_flow import test_master_marketplace_business_flow


__all__ = ["test_master_marketplace_business_flow"]
