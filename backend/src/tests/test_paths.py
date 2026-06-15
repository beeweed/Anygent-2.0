import pytest

from src.utils.paths import SandboxPathError, add_line_numbers, normalize_sandbox_path


def test_normalize_sandbox_path_accepts_valid_path() -> None:
    assert normalize_sandbox_path("/home/user/project/main.py") == "/home/user/project/main.py"


@pytest.mark.parametrize("path", ["", "/etc/passwd", "/home/user/../root/secrets.txt"])
def test_normalize_sandbox_path_rejects_invalid_paths(path: str) -> None:
    with pytest.raises(SandboxPathError):
        normalize_sandbox_path(path)


def test_add_line_numbers() -> None:
    assert add_line_numbers("alpha\nbeta") == "1\talpha\n2\tbeta"
