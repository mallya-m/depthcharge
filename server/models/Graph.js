const mongoose = require("mongoose");

const GraphSchema = new mongoose.Schema(
  {
   sourceKey: {
      type: String,
      required: true,
      unique: true, 
      index: true,  
    },

    graph: {
      nodes: { type: Array, required: true },
      links: { type: Array, required: true },
      stats: { type: Object, required: true },
    },

    parsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Graph", GraphSchema);