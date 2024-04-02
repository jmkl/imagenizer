<script>
  import IconButton from "./IconButton.svelte";

  export let rows;
  export let perPage;
  export let trimmedRows;

  $: totalRows = rows.length;
  $: currentPage = 0;
  $: totalPages = Math.ceil(totalRows / perPage);
  $: start = currentPage * perPage;
  $: end = currentPage === totalPages - 1 ? totalRows - 1 : start + perPage - 1;

  $: trimmedRows = rows.slice(start, end + 1);

  $: totalRows, (currentPage = 0);
  $: currentPage, start, end;
</script>

{#if totalRows && totalRows > perPage}
  <div class="flex flex-row justify-center p-2">
    <IconButton
      disabled={currentPage === 0 ? true : false}
      icon="arrow_left"
      onclick={() => (currentPage -= 1)}
    />

    <p class="mx-2">{currentPage + 1} of {totalPages}</p>

    <IconButton
      disabled={currentPage === totalPages - 1 ? true : false}
      icon="arrow_right"
      onclick={() => (currentPage += 1)}
    />
  </div>
{/if}
