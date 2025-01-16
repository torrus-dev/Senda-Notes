// import { create } from 'domain'
// import { contextBridge } from 'electron'

// const dummyNote = {
//   title: 'Dummy Data', 
//   properties: {
//     created: '2021-09-01',
//     updated: '2021-09-01',
//     publish: true,
//     tags: ['dummy', 'data'],
//     theme: "Web Development"
//   },
//   content: [
//     {
//       "id": 1,
//       "type": "text",
//       "properties": {
//         "block_content": "This is a basic block with dummy text content"
//       },
//       "children" : [],
//       "parent": null
//     }
//   ]
// };

// contextBridge.exposeInMainWorld('data', {
//   getDummyData: () => dummyNote
// })