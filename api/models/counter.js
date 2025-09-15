const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

/**
 * Función para generar el siguiente número secuencial
 * @param {string} sequenceName - Nombre de la secuencia (ej: 'order')
 * @returns {Promise<number>} - El siguiente número en la secuencia
 */
const getNextSequence = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

/**
 * Función para generar un ID de orden con formato ORD-timestamp-número
 * @returns {Promise<string>} - ID de orden generado (ej: ORD-1757943365606-314)
 */
const generateOrderId = async () => {
  const timestamp = Date.now();
  const sequenceNumber = await getNextSequence("order");
  return `ORD-${timestamp}-${sequenceNumber}`;
};

module.exports = {
  Counter,
  getNextSequence,
  generateOrderId,
};
