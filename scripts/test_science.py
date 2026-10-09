import json, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class ProcessedScienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "src/data/site-metrics.json").read_text(encoding="utf-8"))

    def test_coordinate_convention_and_sites(self):
        self.assertIn("positive-east", self.data["coordinateConvention"])
        self.assertEqual(set(self.data["sites"]), {"connecting-ridge", "shackleton-rim", "malapert-massif"})

    def test_values_are_physically_bounded(self):
        for site in self.data["sites"].values():
            for key in ("illumination", "earthVisibility"):
                metric = site["metrics"][key]
                self.assertLessEqual(0, metric["min"])
                self.assertLessEqual(metric["min"], metric["value"])
                self.assertLessEqual(metric["value"], metric["max"])
                self.assertLessEqual(metric["max"], 100)
            if "slope" in site["metrics"]:
                self.assertLessEqual(0, site["metrics"]["slope"]["min"])
                self.assertLessEqual(site["metrics"]["slope"]["max"], 90)

    def test_provenance_and_sampling_metadata(self):
        for site in self.data["sites"].values():
            for metric in site["metrics"].values():
                self.assertEqual(metric["status"], "nasa-derived")
                self.assertEqual(metric["radiusMeters"], 1000)
                self.assertGreater(metric["validPixels"], 0)
                self.assertEqual(len(metric["sha256"]), 64)
                self.assertTrue((ROOT / metric["sourceFile"]).exists())

if __name__ == "__main__": unittest.main()
