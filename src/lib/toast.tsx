import { Toast, toaster } from "@kobalte/core";
import type { ToastRootProps } from "@kobalte/core/dist/types/toast";
import { type Component, type ParentComponent, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Match, Portal, Switch } from "solid-js/web";
import "../assets/toast.css";

export const Toaster: Component = () => {
  return (
    <Portal>
      <Toast.Region limit={99}>
        <Toast.List class="fixed max-w-full bottom-0 right-0 flex flex-col gap-2 z-9999 [--toast-padding:1rem] p-[--toast-padding] items-end" />
      </Toast.Region>
    </Portal>
  );
};

const MyToast: ParentComponent<
  ToastRootProps & {
    variant?: "success" | "error" | "pending";
  }
> = (props) => {
  const [addedProps, kobalteProps] = splitProps(props, ["variant"]);

  return (
    <Toast.Root
      {...kobalteProps}
      class="relative w-200px max-w-full b-1 rounded bg-white p-2 shadow data-[opened]:(animate-slide-in-right! animate-duration-100!) data-[closed]:(animate-fade-out-right animate-duration-100) data-[swipe=move]:translate-x-[--kb-toast-swipe-move-x] data-[swipe=cancel]:(translate-x-0 transition-transform-200) data-[swipe=end]:(animate-[swipeOut] animate-duration-200)"
    >
      <Toast.CloseButton class="absolute bg-transparent c-zinc-600 right-2">
        <div class="i-material-symbols:close-small-rounded w-6 h-6" />
      </Toast.CloseButton>
      <Toast.Description class="flex items-center gap-2">
        <Switch
          fallback={
            <div class="i-material-symbols:info-rounded w-6 h-6 c-blue" />
          }
        >
          <Match when={addedProps.variant === "success"}>
            <div class="i-material-symbols:check-circle-rounded w-6 h-6 c-green" />
          </Match>
          <Match when={addedProps.variant === "error"}>
            <div class="i-material-symbols:cancel-rounded w-6 h-6 c-red" />
          </Match>
          <Match when={addedProps.variant === "pending"}>
            <div class="i-material-symbols:pending w-6 h-6 c-gray" />
          </Match>
        </Switch>
        {props.children}
      </Toast.Description>
    </Toast.Root>
  );
};

const show = (message: string) => {
  return toaster.show((props) => (
    <MyToast toastId={props.toastId}>{message}</MyToast>
  ));
};
const success = (message: string) => {
  return toaster.show((props) => (
    <MyToast toastId={props.toastId} variant="success">
      {message}
    </MyToast>
  ));
};
const error = (message: string) => {
  return toaster.show((props) => (
    <MyToast toastId={props.toastId} variant="error">
      {message}
    </MyToast>
  ));
};
const promise = <T, U>(
  promise: Promise<T> | (() => Promise<T>),
  options: {
    loading?: JSX.Element;
    success?: (data: T) => JSX.Element;
    error?: (error: U) => JSX.Element;
  },
) => {
  return toaster.promise(promise, (props) => (
    <MyToast
      toastId={props.toastId}
      variant={
        props.state === "pending"
          ? "pending"
          : props.state === "fulfilled"
            ? "success"
            : "error"
      }
    >
      <Switch>
        <Match when={props.state === "pending"}>{options.loading}</Match>
        <Match when={props.state === "fulfilled"}>
          {/* biome-ignore lint/style/noNonNullAssertion: data is not null on fulfilled */}
          {options.success?.(props.data!)}
        </Match>
        <Match when={props.state === "rejected"}>
          {options.error?.(props.error)}
        </Match>
      </Switch>
    </MyToast>
  ));
};
const custom = (jsx: () => JSX.Element) => {
  return toaster.show((props) => (
    <Toast.Root toastId={props.toastId}>{jsx()}</Toast.Root>
  ));
};
const dismiss = (id: number) => {
  return toaster.dismiss(id);
};
export const toast = {
  show,
  success,
  error,
  promise,
  custom,
  dismiss,
};
