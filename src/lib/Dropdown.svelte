<script>
  import IconButton from "./IconButton.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  let showMenu = false;
  /**
   * name : string
   * object : any
   */
  export let dropdown_items = null;
  export let selected_index = 0;
  export let active_template = null;
  $: if (selected_index > -1 && dropdown_items != null) {
    active_template = dropdown_items[selected_index];
  }

  let timerid;
  function onEnter() {
    clearTimeout(timerid);
  }
  function onLeave() {
    timerid = setTimeout(() => {
      if (showMenu) showMenu = false;
    }, 100);
  }
</script>

<div class={$$restProps.class || ""}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:click={() => (showMenu = !showMenu)}
    class="cursor-pointer relative border-none w-full rounded-sm px-2 py-1 bg-t-main hover:bg-t-scnd active:bg-t-thrd text-white flex flex-row justify-between"
  >
    <div
      class="font-bold whitespace-nowrap text-ellipsis overflow-hidden w-full"
    >
      {dropdown_items != null ? dropdown_items[selected_index]?.name : "None"}
    </div>
    <div class="tex">
      {#if showMenu}
        <IconButton icon="up" />
      {:else}
        <IconButton icon="down" />
      {/if}
    </div>
  </div>

  {#if showMenu && dropdown_items}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:mouseleave={onLeave}
      on:mouseenter={onEnter}
      class="absolute left-0 z-10 w-full px-8 py-2"
    >
      <div class="bg-t-main flex flex-row flex-wrap justify-center">
        {#each dropdown_items as item, i}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            on:click={() => {
              showMenu = false;
              selected_index = i;

              dispatch("valuechange", { data: item });
            }}
            class="cursor-pointer w-fit p-1 grow text-center text-white hover:bg-t-scnd active:bg-t-thrd"
          >
            <div class="bg-t-thrd p-1">{item.name}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
