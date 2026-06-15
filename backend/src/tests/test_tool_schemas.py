from src.tools.file_read import TOOL_DEFINITION as READ_TOOL
from src.tools.file_write import TOOL_DEFINITION as WRITE_TOOL


def test_file_write_schema_matches_expected_contract() -> None:
    fn = WRITE_TOOL["function"]
    assert fn["name"] == "file_write"
    assert fn["parameters"]["required"] == ["file_path", "content"]


def test_file_read_schema_matches_expected_contract() -> None:
    fn = READ_TOOL["function"]
    assert fn["name"] == "file_read"
    assert fn["parameters"]["required"] == ["file_path"]
