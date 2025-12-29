const Fellow = require("../models/Fellow");
const Company = require("../models/Company");

exports.mergeFellowToCompany = async (req, res) => {
  try {
    const { fellowId, companyId } = req.body;

    const fellow = await Fellow.findById(fellowId);
    const company = await Company.findById(companyId);

    if (!fellow || !company) return res.status(404).json({ error: "Not found" });

    if (company.mergedFellows.length >= company.capacity) {
      return res.status(400).json({ error: "Company capacity full" });
    }

    if (fellow.mergedCompany) {
      return res.status(400).json({ error: "Fellow already merged" });
    }

    fellow.mergedCompany = company._id;
    await fellow.save();

    company.mergedFellows.push(fellow._id);
    await company.save();

    res.json({ message: "Fellow successfully merged to company" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
