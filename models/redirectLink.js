const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const redirectLinkSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "redirect_links" }
);

const RedirectLink = mongoose.model("RedirectLink", redirectLinkSchema);
module.exports = RedirectLink;
