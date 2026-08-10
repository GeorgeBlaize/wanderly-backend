require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const compression = require("compression");
const passport = require("./config/passport");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const tourRoutes = require("./routes/tour.routes");
const categoryRoutes = require("./routes/category.routes");
const bookingRoutes = require("./routes/booking.routes");
const reviewRoutes = require("./routes/review.routes");
const blogRoutes = require("./routes/blog.routes");
const contactRoutes = require("./routes/contact.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(passport.initialize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Wanderly API listening on port ${PORT}`);
});
