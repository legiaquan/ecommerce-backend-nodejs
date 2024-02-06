"use strict";

const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");
const {
  getSelectData,
  unGetSelectData,
  convertToObjectId,
} = require("../../utils");

const findAllDraftsForShopRepo = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShopRepo = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUserRepo = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  return await product
    .find(
      {
        isPublish: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
};

const publishProductByShopRepo = async ({ product_shop, product_id }) => {
  const foundShop = await product
    .findOne({
      _id: new Types.ObjectId(product_id),
      product_shop: new Types.ObjectId(product_shop),
    })
    .lean();

  console.log("foundShop: ", foundShop);
  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublish = true;

  const { modifiedCount } = await product.updateOne(
    { _id: foundShop._id },
    foundShop
  );

  return modifiedCount;
};

const unpublishProductByShopRepo = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  console.log("foundShop: ", foundShop);
  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublish = false;

  const { modifiedCount } = await product.updateOne(
    { _id: foundShop._id },
    foundShop
  );

  return modifiedCount;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllProductsRepo = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  return await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
};

const findProductRepo = async ({ product_id, unSelect }) => {
  return await product
    .findById(product_id)
    .select(unGetSelectData(unSelect))
    .lean();
};

const updateProductRepo = async ({
  productId,
  payload,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, payload, { new: isNew });
};

const getProductById = async (productId) => {
  return await product.findOne({ _id: convertToObjectId(productId) }).lean();
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const fondProduct = await getProductById(product.productId);
      if (fondProduct) {
        return {
          price: foundProduct.product_price,
          quantity: foundProduct.quantity,
          productId: product.productId,
        };
      }
    })
  );
};

module.exports = {
  findAllDraftsForShopRepo,
  findAllPublishForShopRepo,
  publishProductByShopRepo,
  unpublishProductByShopRepo,
  searchProductByUserRepo,
  findAllProductsRepo,
  findProductRepo,
  updateProductRepo,
  getProductById,
  checkProductByServer,
};
