import { create } from 'zustand'

interface PrescriptionDraft {
  medicationName: string
  dosage: string
  frequency: string
  durationDays: number
  notes: string
}

interface LineItemDraft {
  description: string
  quantity: number
  unitPrice: number
}

interface VisitFormState {
  chiefComplaint: string
  examinationFindings: string
  assessment: string
  plan: string
  icd10Codes: string
  prescriptions: PrescriptionDraft[]
  additionalItems: LineItemDraft[]
  setField: <K extends keyof Omit<VisitFormState, 'prescriptions' | 'additionalItems' | 'setField' | 'addPrescription' | 'removePrescription' | 'addAdditionalItem' | 'removeAdditionalItem' | 'updateAdditionalItem' | 'reset'>>(
    key: K,
    value: VisitFormState[K],
  ) => void
  addPrescription: (rx: PrescriptionDraft) => void
  removePrescription: (index: number) => void
  addAdditionalItem: () => void
  removeAdditionalItem: (index: number) => void
  updateAdditionalItem: (index: number, field: keyof LineItemDraft, value: string | number) => void
  reset: () => void
}

const initialState = {
  chiefComplaint: '',
  examinationFindings: '',
  assessment: '',
  plan: '',
  icd10Codes: '',
  prescriptions: [] as PrescriptionDraft[],
  additionalItems: [] as LineItemDraft[],
}

export const useVisitFormStore = create<VisitFormState>((set) => ({
  ...initialState,
  setField: (key, value) => set({ [key]: value }),
  addPrescription: (rx) =>
    set((state) => ({ prescriptions: [...state.prescriptions, rx] })),
  removePrescription: (index) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((_, i) => i !== index),
    })),
  addAdditionalItem: () =>
    set((state) => ({
      additionalItems: [...state.additionalItems, { description: '', quantity: 1, unitPrice: 0 }],
    })),
  removeAdditionalItem: (index) =>
    set((state) => ({
      additionalItems: state.additionalItems.filter((_, i) => i !== index),
    })),
  updateAdditionalItem: (index, field, value) =>
    set((state) => ({
      additionalItems: state.additionalItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    })),
  reset: () => set(initialState),
}))
