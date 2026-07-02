const { z } = require("zod");
const Statuses = require("../constants/statuses");

const objectIdSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: "Invalid Mongoose ObjectId format"
});

const overrideStatusSchema = {
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    status: z.nativeEnum(Statuses)
  })
};

const userActionSchema = {
  params: z.object({
    id: objectIdSchema,
    action: z.enum(["activate", "suspend"])
  })
};

module.exports = {
  overrideStatusSchema,
  userActionSchema
};
