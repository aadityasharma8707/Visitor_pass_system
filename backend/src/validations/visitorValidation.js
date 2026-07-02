const { z } = require("zod");

const objectIdSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: "Invalid Mongoose ObjectId format"
});

const createRequestSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    idProof: z.string().min(2, "ID proof is required"),
    hostId: objectIdSchema,
    purpose: z.string().min(3, "Purpose must be at least 3 characters"),
    visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid visit date format"
    })
  })
};

const paramsIdSchema = {
  params: z.object({
    id: objectIdSchema
  })
};

module.exports = {
  createRequestSchema,
  paramsIdSchema
};
