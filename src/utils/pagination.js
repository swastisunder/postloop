exports.paginate = async ({
  model,
  filter = {},
  page = 1,
  limit = 10,
  populate = null,
}) => {
  page = parseInt(page) || 1;
  limit = Math.min(parseInt(limit) || 10, 50);

  const totalRecords = await model.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

  const safePage = page > totalPages ? totalPages : page;

  const skip = (safePage - 1) * limit;

  let query = model
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (populate)
    if (Array.isArray(populate))
      populate.forEach((p) => {
        query = query.populate(p);
      });
    else query = query.populate(populate);

  const data = await query.lean();

  return {
    data,
    pagination: { totalRecords, totalPages, currentPage: safePage, limit },
  };
};
