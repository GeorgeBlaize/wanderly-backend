const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const submitContact = asyncHandler(async (req, res) => {
  const message = await prisma.contactMessage.create({ data: req.body });
  res.status(201).json(new ApiResponse(201, { message }, "Message sent, we'll get back to you soon"));
});

const adminListMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json(new ApiResponse(200, { messages }));
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });
  res.status(201).json(new ApiResponse(201, { subscriber }, "Subscribed to the newsletter"));
});

module.exports = { submitContact, adminListMessages, subscribeNewsletter };
