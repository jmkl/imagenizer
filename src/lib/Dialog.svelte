<script>
  export let title = "Dialog Title";
  export let content = "Dialog Content";
  export let show = false;
  export let object = null;
  export let onOk = null;
  export let isImage = false;
  function handOnClick(e) {
    const ok = e.target.textContent == "Ok";
    if (ok) {
      onOk(object);
    }
    show = false;
  }
</script>

{#if show}
  {#if isImage}
    <div class="p-4">
      <h1 class="font-bold text-lg">{title}</h1>
      <p class="truncate text-ellipsis overflow-hidden">{object.fullres}</p>
      <div class="flex flex-row justify-end items-center my-2">
        <img
          src={object.thumb}
          alt=""
          class="h-auto w-full rounded-md object-contain"
        />
      </div>
      <div class="flex flex-row p-2 justify-end w-full">
        <div
          on:click={handOnClick}
          class="bg-t-main px-4 hover:bg-t-scnd active:bg-t-thrd py-1 cursor-pointer rounded-sm mx-2"
        >
          Ok
        </div>
        <div
          on:click={handOnClick}
          class="bg-red-950 px-4 hover:bg-t-scnd active:bg-t-thrd py-1 cursor-pointer rounded-sm border border-red-900"
        >
          Cancel
        </div>
      </div>
    </div>
  {:else}
    <div class="p-4">
      <h1 class="font-bold text-lg">{title}</h1>
      <p>{content}</p>
      <div class="flex flex-row p-2 justify-end w-full">
        <div
          on:click={handOnClick}
          class="bg-t-main px-4 hover:bg-t-scnd active:bg-t-thrd py-1 cursor-pointer rounded-sm mx-2"
        >
          Ok
        </div>
        <div
          on:click={handOnClick}
          class="bg-red-950 px-4 hover:bg-t-scnd active:bg-t-thrd py-1 cursor-pointer rounded-sm border border-red-900"
        >
          Cancel
        </div>
      </div>
    </div>
  {/if}
{/if}
