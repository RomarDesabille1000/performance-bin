import create from 'zustand'

const useSignatureStore = create((set) => ({
    image: null,
    w: 0,
    h: 0,
    setImage: (image, w, h) => set((state) => ({ image: image, w: w, h: h })),
}))

export {
    useSignatureStore
}