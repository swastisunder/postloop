require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const CONFIG = {
  USERS: 1000,
  POSTS_PER_USER: 10,
  COMMENTS_PER_POST: 10,
  BATCH_SIZE: 10000,
  RETRY_LIMIT: 3,
};

const MONGO_URI = process.env.MONGO_URI;
// const MONGO_URI = "mongodb://localhost:27017/ssb";

const RUN_ID = Date.now();

/*  HELPERS  */

const withRetry = async (fn, retries = CONFIG.RETRY_LIMIT) => {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 11000) return;
    if (retries <= 0) throw err;
    return withRetry(fn, retries - 1);
  }
  0;
};

const chunk = (start, size, fn) => {
  const arr = [];
  for (let i = 0; i < size; i++) arr.push(fn(start + i));
  return arr;
};

/*  MAIN  */

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("9898", 10);

    /* =======
       👤 USERS
    ======= */

    console.log("🚀 Starting USERS insertion...");

    let userIds = [];
    let userInserted = 0;

    for (let i = 0; i < CONFIG.USERS; i += CONFIG.BATCH_SIZE) {
      const users = chunk(
        i,
        Math.min(CONFIG.BATCH_SIZE, CONFIG.USERS - i),
        (index) => ({
          name: `user_${RUN_ID}_${index}`,
          email: `u_${RUN_ID}_${index}@gmail.com`,
          password: hashedPassword,
          role: "user",
        }),
      );

      const inserted = await withRetry(() =>
        User.insertMany(users, { ordered: false }),
      );

      if (inserted) {
        userIds.push(...inserted.map((u) => u._id));
        userInserted += inserted.length;
      }

      console.log(`👤 Users inserted: ${userInserted}`);
    }

    console.log(`✅ USERS DONE: ${userInserted}`);

    /* =======
       📝 POSTS
    ======= */

    console.log("🚀 Starting POSTS insertion...");

    let posts = [];
    let postInserted = 0;

    for (let userId of userIds) {
      for (let i = 0; i < CONFIG.POSTS_PER_USER; i++) {
        posts.push({
          userId,
          content: `post_${RUN_ID}_${userId}_${i}`,
        });

        if (posts.length === CONFIG.BATCH_SIZE) {
          const inserted = await withRetry(() =>
            Post.insertMany(posts, { ordered: false }),
          );

          if (inserted) postInserted += inserted.length;

          console.log(`📝 Posts inserted: ${postInserted}`);
          posts = [];
        }
      }
    }

    if (posts.length) {
      const inserted = await withRetry(() =>
        Post.insertMany(posts, { ordered: false }),
      );

      if (inserted) postInserted += inserted.length;
    }

    console.log(`✅ POSTS DONE: ${postInserted}`);

    /* =======
       💬 COMMENTS
    ======= */

    console.log("🚀 Starting COMMENTS insertion...");

    const allPosts = await Post.find({}, "_id");

    let comments = [];
    let commentInserted = 0;

    for (let post of allPosts) {
      for (let i = 0; i < CONFIG.COMMENTS_PER_POST; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];

        comments.push({
          postId: post._id,
          userId: randomUser,
          content: `comment_${RUN_ID}_${post._id}_${i}`,
        });

        if (comments.length === CONFIG.BATCH_SIZE) {
          const inserted = await withRetry(() =>
            Comment.insertMany(comments, { ordered: false }),
          );

          if (inserted) commentInserted += inserted.length;

          console.log(`💬 Comments inserted: ${commentInserted}`);
          comments = [];
        }
      }
    }

    if (comments.length) {
      const inserted = await withRetry(() =>
        Comment.insertMany(comments, { ordered: false }),
      );

      if (inserted) commentInserted += inserted.length;
    }

    console.log(`✅ COMMENTS DONE: ${commentInserted}`);

    /* =======
       🎉 DONE
    ======= */

    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY");
    console.log({
      users: userInserted,
      posts: postInserted,
      comments: commentInserted,
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  }
};

seed();
