import unittest
import os
import tempfile
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.security_guardrails import analyze_py_code, validate_safe_path

class TestSecurityGuardrails(unittest.TestCase):

    def test_safe_python_code(self):
        safe_code_list = [
            "x = 1 + 2",
            "print('Hello, world!')",
            "def test():\n    return [i for i in range(10)]",
            "import math\nmath.sqrt(16)"
        ]
        for code in safe_code_list:
            is_safe, violations = analyze_py_code(code)
            self.assertTrue(is_safe, f"Should be safe: {code}. Violations: {violations}")

    def test_unsafe_imports(self):
        unsafe_code_list = [
            "import os",
            "import sys",
            "from subprocess import Popen"
        ]
        for code in unsafe_code_list:
            is_safe, _ = analyze_py_code(code)
            self.assertFalse(is_safe, f"Should be unsafe: {code}")

    def test_unsafe_builtins(self):
        unsafe_code_list = [
            "eval('1+1')",
            "exec('import os')",
            "globals()",
            "open('test.txt', 'r')"
        ]
        for code in unsafe_code_list:
            is_safe, _ = analyze_py_code(code)
            self.assertFalse(is_safe, f"Should be unsafe: {code}")

    def test_safe_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            safe_rel_path = "test_file.txt"
            resolved = validate_safe_path(safe_rel_path, base_dir=temp_dir)
            self.assertTrue(resolved.startswith(os.path.realpath(temp_dir)))

    def test_path_traversal_detection(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(PermissionError):
                validate_safe_path("../outside.txt", base_dir=temp_dir)

    def test_sensitive_files_block(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(PermissionError):
                validate_safe_path(".env", base_dir=temp_dir)

if __name__ == '__main__':
    unittest.main()
