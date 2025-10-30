import mongoose from "mongoose";

const robotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alias: { type: String, default: "" },     // opcional, para UI
  status: { type: String, default: "idle" },// idle|running|error|offline
  battery: { type: Number, default: 100 },  // %
  latencyMs: { type: Number, default: 0 },  // ms
  distance: { type: Number, default: 0 },   // km acumulados
  speed: { type: Number, default: 0 },      // km/h
}, { timestamps: true });

export const Robot = mongoose.model("Robot", robotSchema);
