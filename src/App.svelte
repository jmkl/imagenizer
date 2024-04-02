<script>
  import { onMount } from "svelte";
  import Dropdown from "./lib/Dropdown.svelte";
  import Pagination from "./lib/Pagination.svelte";
  import Spacer from "./lib/Spacer.svelte";
  import md5 from "./utils/md5.js";
  import {
    PickFolderFor,
    GetTokenFor,
    TOKEN,
    FOLDERNAME,
    insertSmartObject,
    SaveCurrentLayerAsSmartObject,
    getSmartObjectNativePath,
  } from "./utils/psutils";
  import IconButton from "./lib/IconButton.svelte";
  import Dialog from "./lib/Dialog.svelte";
  let image_provider = ["smart object", "textures", "online"];
  //all current content
  let all_contents;
  //visible content
  let visible_content;
  //all current content unfiltered
  let stored_contents;
  let all_smartobjectcontent;

  let texture_categories = [];
  let texture_category_index = 0;
  let stocksolopage = 1;
  const stockurl = (keyword) =>
    `https://app.stocksolo.com/search?search=${encodeURI(
      keyword
    )}&page=${stocksolopage}`;

  const texture_url = "http://localhost:3000/texture";
  let root_folder, texture_folder, onlineimage_folder, smartobject_folder;
  let imagemode_entries;
  $: imagemode_entries = [
    smartobject_folder,
    texture_folder,
    onlineimage_folder,
  ];
  $: {
    switch (imagemode_index) {
      case 0:
        text_filter = "";
        initCustomScripts();
        break;
      case 1:
        fetchTextureCategory(texture_categories[texture_category_index]);
        break;
      case 2:
        fetchOnlineImage();
        //fetchTextureCategory(texture_categories[texture_category_index]);
        break;
    }
  }

  let socket = new WebSocket("ws://localhost:7898/Server");
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.fromserver) {
      switch (data.type) {
        case "createthumb":
        case "deletethumb":
          initCustomScripts();
          is_loading = false;
          break;
      }
    }
  });
  function sendJSONMessage(message) {
    if (socket.readyState <= 1) {
      socket.send(JSON.stringify(message));
    }
  }

  function fetchOnlineImage() {
    is_loading = true;
    if (!keyword) {
      all_contents = [];
      stored_contents = [];
      is_loading = false;
      return;
    }

    fetch(stockurl(keyword, stocksolopage))
      .then((r) => {
        if (r.ok) return r.json();
      })
      .then((result) => {
        let total = result.total;
        let alldata = result.items.filter((data) => {
          return data.fullResolution.url != null;
        });
        all_contents = alldata.map((data) => {
          return {
            name: data.id,
            thumb: data.preview.url,
            fullres: data.fullResolution.url,
          };
        });
        stored_contents = all_contents;
        is_loading = false;
      })
      .catch((e) => {
        is_loading = false;
      });
  }

  function fetchTextureCategory(category) {
    fetch(`${texture_url}/cat/${category}`)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((result) => {
        // name, favorite:bool, category:string _id
        all_contents = result.map((p) => {
          return {
            name: p.name,
            category: p.category,
            favorite: p.favorite,
            thumb: `file:\\\\${texture_folder.nativePath}\\\.thumbnail\\${
              category == "Vector" ? p.name.replace("eps", "jpg") : p.name
            }`,
          };
        });
        stored_contents = all_contents;
      });
  }

  function initTexture() {
    fetch(`${texture_url}/all`)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((result) => (texture_categories = result));
  }

  function initCustomScripts() {
    if (root_folder == null) return;
    root_folder.getEntry("texture").then((result) => (texture_folder = result));
    root_folder.getEntry(FOLDERNAME.smartobject).then(async (result) => {
      smartobject_folder = result;
      const thumbnail_file =
        await smartobject_folder.getEntry("thumbnail.json");
      const thumbnail_content = JSON.parse(await thumbnail_file.read());
      all_contents = thumbnail_content.map((p) => {
        return {
          name: p.name,
          thumb: `file:\\\\${smartobject_folder.nativePath}\\thumbnails\\${p.name}.png`,
        };
      });
      stored_contents = all_contents;
      all_smartobjectcontent = all_contents;
      if (text_filter != null)
        all_contents = stored_contents.filter((e) =>
          e.name.includes(text_filter)
        );
    });
    root_folder
      .getEntry(FOLDERNAME.download)
      .then((result) => (onlineimage_folder = result));
  }
  function getRootFolder() {
    GetTokenFor(TOKEN.ROOTFOLDER)
      .then((result) => {
        root_folder = result;
        initCustomScripts();
      })
      .catch(async (e) => {
        root_folder = await PickFolderFor(TOKEN.ROOTFOLDER);
        initCustomScripts();
      });
  }
  onMount(() => {
    getRootFolder();
    initTexture();
  });
  let filter_timeout;
  let is_loading = false;
  let text_filter;
  let keyword;
  function applyFilter(textfilter) {
    is_loading = true;
    text_filter = textfilter;
    if (filter_timeout) clearTimeout(filter_timeout);
    filter_timeout = setTimeout(() => {
      all_contents = stored_contents.filter((e) => e.name.includes(textfilter));
      is_loading = false;
    }, 500);
  }
  let imagemode_index = 0;
  let dialog_content = {
    title: "Yo!!",
    content: "Sup dawg!",
    show: false,
    object: null,
  };

  function previewToDownload(content) {}

  async function downloadImage(content) {
    is_loading = true;
    const urldata = content.fullres;
    const name = `${md5(urldata)}.jpg`;

    onlineimage_folder
      .getEntry(name)
      .then((result) => {
        insertSmartObject(result);
        is_loading = false;
      })
      .catch((e) => {
        fetch(urldata)
          .then((result) => {
            if (result.ok) return result.arrayBuffer();
          })
          .then(async (buffer) => {
            const newjpeg = await onlineimage_folder.createFile(name, {
              overwrite: true,
            });
            await newjpeg
              .write(buffer, { format: require("uxp").storage.formats.binary })
              .then(async (resp) => {
                insertSmartObject(newjpeg);
                is_loading = false;
              })
              .catch((e) => {
                console.log(e);
                is_loading = false;
              });
          });
      });
  }
  let image_to_show;
  let current_active_url;
</script>

<main class="p-2 text-white font-jetbrain">
  <Dialog
    onOk={(obj) => {
      if (obj != null) {
        switch (imagemode_index) {
          case 0:
            getSmartObjectNativePath(
              imagemode_entries[imagemode_index],
              obj
            ).then((result) => {
              sendJSONMessage({
                type: "deletethumb",
                fromserver: false,
                data: result,
              });
            });

            break;
          case 1:
            const _url = `${texture_url}/fav/${obj.name}/${obj.favorite}`;

            fetch(_url)
              .then((response) => {
                if (response.ok) {
                  return response.json();
                }
              })
              .then((data) => {
                // const entrytexture_cat = {...entryTextureCategory};
                // entrytexture_cat.content[entrytexture_cat.content.findIndex((e) => e.name === item.name)].favorite = !item.favorite;
                // setEntryTextureCategory(entrytexture_cat);
              });
            break;
          case 2:
            downloadImage(obj);
            break;
        }
      }
    }}
    object={dialog_content.object}
    title={dialog_content.title}
    isImage={dialog_content.isImage}
    content={dialog_content.content}
    bind:show={dialog_content.show}
  />
  {#if !dialog_content.show}
    <div class="flex flex-row">
      {#if imagemode_index == 0}
        <IconButton
          oncontextmenu={() => {}}
          onclick={() => {
            if (text_filter == "") return;
            is_loading = true;
            SaveCurrentLayerAsSmartObject(
              smartobject_folder,
              all_smartobjectcontent,
              text_filter
            )
              .then((result) => {
                if (result) {
                  is_loading = true;
                  sendJSONMessage({
                    type: "createthumb",
                    fromserver: false,
                    data: result,
                  });
                }
              })
              .catch((e) => {
                console.log(e);
                is_loading = false;
              });
          }}
          class="pr-1 flex items-center"
          icon="image"
        />
        <sp-textfield
          quiet
          value={text_filter}
          size="s"
          class="w-full"
          on:input={(e) => {
            applyFilter(e.target.value);
          }}
        />
      {:else if imagemode_index == 1}
        <Dropdown
          on:valuechange={(e) => {
            console.log(e);
          }}
          bind:selected_index={texture_category_index}
          class="w-full"
          dropdown_items={texture_categories.map((e) => {
            return { name: e, object: e };
          })}
        />
      {:else}
        <sp-textfield
          disabled={is_loading}
          quiet
          value={keyword}
          size="s"
          class="w-full"
          on:keydown={(e) => {
            if (e.key == "Enter") {
              stocksolopage = 1;
              fetchOnlineImage();
            }
          }}
          on:input={(e) => {
            keyword = e.target.value;
            //applyFilter(e.target.value);
          }}
        />
        <Spacer w="5px" />
        <IconButton
          oncontextmenu={() => {}}
          disabled={stocksolopage >= 1}
          onclick={() => {
            if (stocksolopage > 1) stocksolopage -= 1;
            fetchOnlineImage();
          }}
          class="flex items-center"
          icon="left"
        />
        <Spacer w="5px" />
        <IconButton
          oncontextmenu={() => {}}
          onclick={() => {
            if ((keyword == null) | (keyword == "")) return;
            if (stocksolopage >= 1) stocksolopage += 1;
            console.log(stocksolopage);
            fetchOnlineImage();
          }}
          class="flex items-center"
          icon="right"
        />
      {/if}
      <Spacer w="5px" />
      <Dropdown
        class="w-3/5"
        bind:selected_index={imagemode_index}
        dropdown_items={image_provider.map((e) => {
          return { name: e, object: e };
        })}
      />
    </div>

    <div class="content">
      {#if all_contents}
        <Pagination
          rows={all_contents}
          perPage={30}
          bind:trimmedRows={visible_content}
        />

        {#if visible_content}
          {#if is_loading}
            <div class="flex justify-center items-center h-screen bg-[#2f2e34]">
              <img src="./icons/loading.gif" alt="loading" />
            </div>
          {:else}
            <div
              class="flex flex-row flex-wrap overflow-y-auto h-[calc(100vh-100px)]"
            >
              {#each visible_content as content, i}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img
                  on:contextmenu={() => {
                    switch (imagemode_index) {
                      case 0:
                        dialog_content = {
                          title: "Deleting smart object?",
                          content: "Are u sure u wanna delete this file?...",
                          show: true,
                          object: content.name,
                        };
                        break;
                      case 1:
                        if (
                          texture_categories[texture_category_index] ==
                          "Favorites"
                        )
                          return;
                        dialog_content = {
                          title: "Add to Favorite?",
                          content: "Are u sure u wanna delete this file?...",
                          show: true,
                          object: content,
                        };
                        break;
                      case 2:
                        console.log(content);

                        break;
                    }
                  }}
                  on:click={() => {
                    switch (imagemode_index) {
                      case 0:
                        smartobject_folder
                          .getEntry(content.name + ".psb")
                          .then((result) => {
                            insertSmartObject(result);
                          });
                        break;
                      case 1:
                        texture_folder
                          .getEntry(`${content.category}/${content.name}`)
                          .then((file) => {
                            insertSmartObject(file);
                          });
                        break;
                      case 2:
                        dialog_content = {
                          title: "Download This Image",
                          content: content.fullres,
                          show: true,
                          isImage: true,
                          object: content,
                        };
                        //previewToDownload(content);
                        break;
                    }
                  }}
                  class="w-1/3 h-[80px] object-cover p-1 hover:bg-t-main cursor-pointer"
                  src={content.thumb}
                  alt={content.name}
                />
              {/each}
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  {/if}
</main>
