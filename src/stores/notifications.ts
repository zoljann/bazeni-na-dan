import { ref } from "vue";
import { defineStore } from "pinia";
import { useTimeoutFn } from "@vueuse/core";

type Notification = {
  id: number;
  text: string[];
  type: "success" | "error";
};

const notificationsStore = defineStore("notificationsStore", () => {
  const notifications = ref<Notification[]>([]);

  const removeNotification = (index: number) => {
    notifications.value.splice(index, 1);
  };

  const addNotification = (
    text: string,
    type: "success" | "error",
    duration = 4000,
  ) => {
    const n: Notification = {
      id: Date.now() + Math.random(),
      text: [text],
      type,
    };
    notifications.value.push(n);

    if (notifications.value.length > 2) {
      notifications.value.shift();
    }

    useTimeoutFn(() => {
      const index = notifications.value.findIndex((x) => x.id === n.id);
      if (index !== -1) notifications.value.splice(index, 1);
    }, duration);
  };

  return { notifications, addNotification, removeNotification };
});

export { notificationsStore };
