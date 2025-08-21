import { defineStore } from "pinia";
import { fetchOrderHistory, cancelOrder as cancelOrderApi } from "@/services/orderService";
import { useUserStore } from "@/store/userStore";
import { useProductStore } from "@/store/productStore";

export const useOrderStore = defineStore("orderStore", {
  state: () => ({
    orders: [],
    isLoading: false,
  }),

  actions: {
    async loadOrderHistory() {
      const userStore = useUserStore();
      const daigoId = userStore.profile?.id;

      if (!daigoId) {
        return;
      }

      this.isLoading = true;
      try {
        const data = await fetchOrderHistory(daigoId);
        this.orders = await this.transformOrders(data);
        console.log("Pfuhepbkb")
      } catch (error) {
        console.error("❌ Ошибка при загрузке истории заказов:", error);
      } finally {
        this.isLoading = false;
      }
    },

    getFullImageUrl(imageUrl) {
      if (!imageUrl) return "";
      return imageUrl.startsWith("http") ? imageUrl : `https://api.daigo.ru${imageUrl}`;
    },

    async transformOrders(data) {
      const productStore = useProductStore();
    
      await productStore.fetchProducts();
    
      return data.map((entry, index) => {
    
        const itemIds = Array.isArray(entry.ItemIDs) ? entry.ItemIDs : [];

        const mappedItems = itemIds.map((itemId) => {
          const product = productStore.products.find(p => p.product_id === itemId);
    
          if (!product) {
            console.warn(`⚠️ Продукт с ID ${itemId} не найден в productStore`);
          }
    
          const firstImageUrl = product?.images?.[0]?.image_url;
    
          return {
            id: itemId,
            name: product?.name || "Товар",
            image: firstImageUrl ? this.getFullImageUrl(firstImageUrl) : "/test-data/default-product.png",
            quantity: 1,
          };
        });
    
        const status = entry.status || "В обработке";
        
        return {
          id: entry.history_id,
          date: entry.order_date,
          number: String(entry.order_id).padStart(8, "0"),
          status,
          total: entry.total_amount,
          bonus: entry.bonus || null,
          items: mappedItems,
          confirmationUrl: entry.confirmation_url || null,
        };
      });
    }, 
    async cancelOrder(orderId) {
      const order = this.orders.find((o) => o.number === String(orderId).padStart(8, "0"));
    
      if (!order) {
        throw new Error("Заказ не найден");
      }
    
      if (["received", "paid"].includes(order.status)) {
        throw new Error("Нельзя отменить полученный или оплаченный заказ");
      }
    
      try {
        await cancelOrderApi(orderId);
        await this.loadOrderHistory();
      } catch (error) {
        console.error("Ошибка отмены заказа:", error);
        throw error;
      }
    }           
  },
});
