import unittest
import os
import tempfile
import shutil
from tools.math.calculator import CalculatorTool
from tools.filesystem.read_file import ReadFileTool
from tools.filesystem.write_file import WriteFileTool
from tools.filesystem.list_directory import ListDirectoryTool

class TestCalculatorTool(unittest.TestCase):
    def setUp(self):
        self.tool = CalculatorTool()

    def test_addition(self):
        self.assertEqual(self.tool.execute("add", 5, 3), 8)
        self.assertEqual(self.tool.execute("add", -1, 1), 0)
        self.assertEqual(self.tool.execute("add", 5.5, 4.5), 10.0)

    def test_subtraction(self):
        self.assertEqual(self.tool.execute("subtract", 10, 4), 6)
        self.assertEqual(self.tool.execute("subtract", 0, 5), -5)

    def test_multiplication(self):
        self.assertEqual(self.tool.execute("multiply", 3, 4), 12)
        self.assertEqual(self.tool.execute("multiply", -2, 3), -6)

    def test_division(self):
        self.assertEqual(self.tool.execute("divide", 10, 2), 5.0)
        self.assertEqual(self.tool.execute("divide", 5, 2), 2.5)
        self.assertEqual(self.tool.execute("divide", 10, 0), "Error: Division by zero.")

    def test_invalid_operation(self):
        self.assertEqual(self.tool.execute("power", 2, 3), "Error: Unknown operation 'power'.")

    def test_string_numeric_parsing(self):
        self.assertEqual(self.tool.execute("add", "5", "3"), 8)
        self.assertEqual(self.tool.execute("add", "5.5", "4.5"), 10.0)

    def test_invalid_numeric_inputs(self):
        self.assertEqual(self.tool.execute("add", "invalid", 5), "Error: 'invalid' is not a valid numeric value.")
        self.assertEqual(self.tool.execute("add", 5, "invalid"), "Error: 'invalid' is not a valid numeric value.")
        self.assertEqual(self.tool.execute("add", None, 5), "Error: 'None' is not a valid numeric value.")


class TestFilesystemTools(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.read_tool = ReadFileTool()
        self.write_tool = WriteFileTool()
        self.list_tool = ListDirectoryTool()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_write_and_read_file(self):
        filepath = os.path.join(self.temp_dir, "test_file.txt")
        content = "Hello, world!\nTesting filesystem tools."
        
        # Test write_file
        write_result = self.write_tool.execute(filepath, content)
        self.assertEqual(write_result, "File written.")
        self.assertTrue(os.path.exists(filepath))
        
        # Test read_file
        read_result = self.read_tool.execute(filepath)
        self.assertEqual(read_result, content)

    def test_list_directory(self):
        # Create some files in temp directory
        file1 = os.path.join(self.temp_dir, "file1.txt")
        file2 = os.path.join(self.temp_dir, "file2.txt")
        
        self.write_tool.execute(file1, "one")
        self.write_tool.execute(file2, "two")
        
        # Test list_directory
        files = self.list_tool.execute(self.temp_dir)
        self.assertIn("file1.txt", files)
        self.assertIn("file2.txt", files)
        self.assertEqual(len(files), 2)

    def test_read_nonexistent_file(self):
        filepath = os.path.join(self.temp_dir, "nonexistent.txt")
        with self.assertRaises(FileNotFoundError):
            self.read_tool.execute(filepath)

    def test_list_nonexistent_directory(self):
        dirpath = os.path.join(self.temp_dir, "nonexistent_dir")
        with self.assertRaises(FileNotFoundError):
            self.list_tool.execute(dirpath)

if __name__ == "__main__":
    unittest.main()
