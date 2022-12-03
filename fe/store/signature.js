import create from 'zustand'

const useSignatureStore = create((set) => ({
    activePanel: 'Rubric',
    image: null,
    w: 0,
    h: 0,
    setImage: (image, w, h) => set((state) => ({ image: image, w: w, h: h })),
    setActivePanel: (activePanel) => set((state) => ({ activePanel: activePanel })),
}))

export {
    useSignatureStore
}