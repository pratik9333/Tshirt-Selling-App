exports.home = async (req, res) => {
  try {
    res.status(200).json({ success: true, greetings: "Hello from our api" });
  } catch (error) {
    res.status(201).json({ error: "Request failed" });
  }
};

exports.dummyUrl = async (req, res) => {
  try {
    res
      .status(200)
      .json({ success: true, greetings: "Hello from our dummy API" });
  } catch (error) {
    res.status(201).json({ error: "Request failed" });
  }
};
