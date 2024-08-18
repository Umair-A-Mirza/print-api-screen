import SelectedAttribute from "../../../types/combinations/selected_attribute";
import { useApi } from "../core";

export const useCustom = () => {
    const api = useApi("products");

    /**
     * Will return whether the product is valid or not.
     * @param attributes The attributes of the custom product request.
     * @returns
     */
    const validProduct = async (
        attributes: SelectedAttribute[],
        id: string,
    ) => {
        return api.post({ attributes: attributes }, id);
    };

    // Other API methods can be added when required.

    return { validProduct };
};
