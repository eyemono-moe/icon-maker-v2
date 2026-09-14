import {
  Toaster as ArkToaster,
  Toast,
  createToaster,
} from "@ark-ui/solid/toast";
import { type Component, Match, Switch } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";

const toaster = createToaster({
  placement: "bottom-end",
  gap: 8,
  max: 99,
});

export const Toaster: Component = () => (
  <Portal>
    <ArkToaster
      toaster={toaster}
      class="fixed max-w-full bottom-0 right-0 flex flex-col gap-2 z-9999 [--toast-padding:1rem] p-[--toast-padding] items-end"
    >
      {(toast) => (
        <Toast.Root class="relative w-200px max-w-full b-1 rounded bg-white p-2 shadow data-[state=open]:(animate-slide-in-right! animate-duration-100!) data-[state=closed]:(animate-fade-out-right animate-duration-100)">
          <Toast.CloseTrigger
            class="absolute bg-transparent c-zinc-600 right-2"
            aria-label="Dismiss notification"
          >
            <div class="i-material-symbols:close-small-rounded w-6 h-6" />
          </Toast.CloseTrigger>
          <Toast.Title class="flex items-center gap-2 pr-6">
            <Switch
              fallback={
                <div class="i-material-symbols:info-rounded w-6 h-6 c-blue" />
              }
            >
              <Match when={toast().type === "success"}>
                <div class="i-material-symbols:check-circle-rounded w-6 h-6 c-green" />
              </Match>
              <Match when={toast().type === "error"}>
                <div class="i-material-symbols:cancel-rounded w-6 h-6 c-red" />
              </Match>
              <Match when={toast().type === "loading"}>
                <div class="i-material-symbols:pending w-6 h-6 c-gray" />
              </Match>
            </Switch>
            {toast().title}
          </Toast.Title>
        </Toast.Root>
      )}
    </ArkToaster>
  </Portal>
);

const show = (message: string) => toaster.create({ title: message });
const success = (message: string) => toaster.success({ title: message });
const error = (message: string) => toaster.error({ title: message });

const promise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  options: {
    loading?: JSX.Element;
    success?: (data: T) => JSX.Element;
    error?: (error: unknown) => JSX.Element;
  },
) =>
  toaster.promise(promise, {
    loading: { title: options.loading, type: "loading" },
    success: (data) => ({ title: options.success?.(data), type: "success" }),
    error: (reason) => ({ title: options.error?.(reason), type: "error" }),
  });

const custom = (jsx: () => JSX.Element) =>
  toaster.create({ title: jsx(), type: "info" });
const dismiss = (id: string) => toaster.dismiss(id);

export const toast = {
  show,
  success,
  error,
  promise,
  custom,
  dismiss,
};
