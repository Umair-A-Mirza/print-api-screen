import { ref } from "vue";
import { useAttributes } from "../api/flyer/attributes";
import { useCategories } from "../api/flyer/categories";
import { useCombinations } from "../api/flyer/combinations";
import { useCompress } from "./compress";
import { useCustom } from "../api/flyer/custom";
import type Category from "../../types/categories/category";
import type FlyerAttributes from "../../types/products/flyer/flyer";
import type ProductContainer from "../../types/combinations/product_container";
import type SelectedAttribute from "../../types/combinations/selected_attribute";
import type Price from "../../types/combinations/price";
import type FlyerPriceRow from "../../types/db/flyer_price_row";
import type FlyerPriceRowDecompressed from "../../types/db/flyer_price_row_decompressed";
import type Data from "../../types/db/data";
import type CustomPrice from "../../types/custom/custom_price";
import { db } from "../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

export const useFlyerData = () => {
  const { getCategories } = useCategories();
  const { getAttributes } = useAttributes();
  const { getCombinations } = useCombinations();
  const { compress, decompress } = useCompress();

  const flyerCat = ref<Category>({
    name: "",
    sku: "",
    combinationsModifiedAt: "",
  });
  const loaded = ref(false);
  const error = ref(false);

  const attributes = ref<FlyerAttributes>();
  const combinations = ref<ProductContainer[]>([]);

  const dbData = ref<FlyerPriceRowDecompressed[]>([]);
  const flyerID = ref("");

  const { validProduct } = useCustom();

  /**
   * Fetches data from the API and processes it to be used in the application.
   */
  const refresh = async () => {
    const categories: Category[] = await getCategories("", "/categories");

    if (!categories) {
      error.value = true;
    }

    flyerCat.value = categories.find((cat: Category) =>
      cat.name === "Flyers"
    ) as Category;

    if (!flyerCat.value || !(Object.keys(flyerCat.value).length > 0)) {
      error.value = true;
    }

    flyerID.value = flyerCat.value.sku;

    attributes.value = await getAttributes(flyerID.value, "/attributes");

    if (!attributes) {
      error.value = true;
    }

    combinations.value = await getCombinations(flyerID.value, "/combinations");

    if (!combinations) {
      error.value = true;
    }

    loaded.value = true;
  };

  const loadDataFromDB = async () => {
    const q = query(
      collection(db, "flyer_prices"),
      orderBy("created_at", "desc"),
      limit(1),
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const res = { id: doc.id, ...doc.data() } as FlyerPriceRow;
      const resDec = {
        id: res.id,
        created_at: res.created_at,
        data: decompress(res.data),
      } as FlyerPriceRowDecompressed;
      dbData.value.push(resDec);
    });

    console.log(dbData.value);
  };

  const updateDB = async (data: Data) => {
    try {
      const cd = compress(data);
      await addDoc(collection(db, "flyer_prices"), {
        data: cd,
        created_at: Timestamp.now(),
      });
      console.log("Completed");
    } catch (e) {
      console.error("Error adding document:", e);
      error.value = true;
    }
  };

  const accessData = () => {
    return { flyerCat, attributes, combinations };
  };

  /**
   * A search function for the prices of a product based on the selected attributes.
   * @param userAttributes The attributes selected by the user from the input fields.
   * @returns Price[] The prices of the product based on the selected attributes.
   */
  const getPrices = (userAttributes: SelectedAttribute[]): Price[] => {
    return combinations.value
      .filter((container: ProductContainer) => {
        const productAttrs = container.product.attributes;

        // Boolean to check if all the user-selected attributes match the product attributes.
        const allMatch = userAttributes.every((attr: SelectedAttribute) =>
          productAttrs.some(
            (productAttr: SelectedAttribute) =>
              productAttr.attribute === attr.attribute &&
              productAttr.value === attr.value,
          )
        );

        // We are looking for an exact match, so the length of the product attributes should be the same as the user-selected attributes.
        const exact = allMatch && productAttrs.length === userAttributes.length;

        return exact;
      })
      .flatMap((container: ProductContainer) => container.product.prices);
  };

  const getCustomPrice = async (
    attributes: SelectedAttribute[],
  ): Promise<CustomPrice> => {
    return await validProduct(attributes, flyerID.value);
  };

  return {
    refresh,
    accessData,
    loaded,
    getPrices,
    error,
    loadDataFromDB,
    updateDB,
    getCustomPrice,
  };
};
