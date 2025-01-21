import { Model } from "mongoose";

const Paginator = async (
  model: Model<any>,
  page: number = 1,
  limit: number = 10,
  populate: any = null,
  filter: any = {},
  sort: any = null,
  select: any = null
) => {
  const skip = (page - 1) * limit;
  const totalItems = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const data = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec();
  return {
    totalItems,
    totalPages,
    data,
  };
};

export default Paginator;
