import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Icon from '@/components/ui/Icon'

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Seguro que deseas continuar?',
  className = 'max-w-md',
  themeClass = 'bg-slate-900 dark:bg-slate-800 dark:border-b dark:border-slate-700'
}) => {
  if (!open) return null

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-[99999]' onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter='duration-300 ease-out'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='duration-200 ease-in'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-slate-900/50 backdrop-filter backdrop-blur-sm' />
        </Transition.Child>

        {/* Contenedor */}
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full justify-center items-center p-6 text-center'>
            <Transition.Child
              as={Fragment}
              enter='duration-300 ease-out'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='duration-200 ease-in'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-md
                  bg-white dark:bg-slate-800 text-left align-middle shadow-xl transition-all ${className}`}
              >
                {/* HEADER */}
                <div
                  className={`relative overflow-hidden py-4 px-5 text-white flex justify-between ${themeClass}`}
                >
                  <h2 className='leading-6 tracking-wider font-medium text-base text-white'>
                    {title}
                  </h2>

                  <button onClick={onClose} className='text-[22px]'>
                    <Icon icon='heroicons-outline:x' />
                  </button>
                </div>

                {/* CUERPO */}
                <div className='px-6 py-8'>
                  <p className='text-slate-700 dark:text-slate-200 text-center text-[17px]'>
                    {message}
                  </p>
                </div>

                {/* FOOTER */}
                <div className='px-4 py-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700'>
                  <button
                    onClick={onClose}
                    className='px-4 py-2 rounded-lg bg-slate-300 hover:bg-slate-400
                               dark:bg-slate-700 dark:hover:bg-slate-600'
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={onConfirm}
                    className='px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white'
                  >
                    Confirmar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ConfirmModal
