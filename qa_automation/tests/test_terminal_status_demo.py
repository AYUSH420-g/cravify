"""
test_terminal_status_demo.py — Terminal-visible pass/fail demo tests

This file prints a clear PASS/FAIL label in the terminal so the result is
easy to read when the test is executed with pytest.
"""

import pytest


@pytest.mark.parametrize(
    "tc_id,left,right,expected_status",
    [
        ("TC_TERM_01", 2 + 2, 4, "PASS"),
        ("TC_TERM_02", 2 + 2, 5, "PASS"),
    ],
)
def test_terminal_status_demo(tc_id, left, right, expected_status):
    condition = left == right
    status = "PASS" if condition else "FAIL"
    print(f"{tc_id}: {status} -> {left} == {right}")
    assert status == expected_status
