import { createApp } from 'vue'
import i18n from "./plugins/i18n";
import { createVuestic } from 'vuestic-ui'
import { createGtm } from '@gtm-support/vue-gtm'

import stores from './stores'
import router from './router'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import 'primevue/resources/primevue.min.css'

import AutoComplete from 'primevue/autocomplete'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Badge from 'primevue/badge'
import BadgeDirective from 'primevue/badgedirective'
import Button from 'primevue/button'
import Breadcrumb from 'primevue/breadcrumb'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Carousel from 'primevue/carousel'
import Checkbox from 'primevue/checkbox'
import Chip from 'primevue/chip'
import Chips from 'primevue/chips'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmPopup from 'primevue/confirmpopup'
import ConfirmationService from 'primevue/confirmationservice'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import DataView from 'primevue/dataview'
import Dialog from 'primevue/dialog'
import DialogService from 'primevue/dialogservice'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import DynamicDialog from 'primevue/dynamicdialog'
import Fieldset from 'primevue/fieldset'
import FileUpload from 'primevue/fileupload'
import Image from 'primevue/image'
import InlineMessage from 'primevue/inlinemessage'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import Listbox from 'primevue/listbox'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import OverlayPanel from 'primevue/overlaypanel'
import Paginator from 'primevue/paginator'
import Panel from 'primevue/panel'
import Password from 'primevue/password'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Rating from 'primevue/rating'
import RadioButton from 'primevue/radiobutton'
import Ripple from 'primevue/ripple'
import Row from 'primevue/row'
import SelectButton from 'primevue/selectbutton'
import Skeleton from 'primevue/skeleton'
import Slider from 'primevue/slider'
import Sidebar from 'primevue/sidebar'
import SplitButton from 'primevue/splitbutton'
import StyleClass from 'primevue/styleclass'
import TabMenu from 'primevue/tabmenu'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Toolbar from 'primevue/toolbar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import ToggleButton from 'primevue/togglebutton'
import Tooltip from 'primevue/tooltip'
import { createPinia } from 'pinia'
// @ts-ignore
import CodeHighlight from '@/components/CodeHighlight.vue'
// @ts-ignore
import BlockViewer from '@/components/BlockViewer.vue'
import 'primeicons/primeicons.css'

import 'primevue/resources/themes/lara-light-indigo/theme.css'

import './axios'

import 'filepond/dist/filepond.min.css';
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

const app = createApp(App)

app.use(createPinia())
app.use(stores)
app.use(router)
app.use(i18n)
app.use(PrimeVue, { ripple: true })
app.use(DialogService)
app.use(ConfirmationService)

app.directive('tooltip', Tooltip)
app.directive('badge', BadgeDirective)
app.directive('ripple', Ripple)
app.directive('styleclass', StyleClass)

app.component('CodeHighlight', CodeHighlight)
app.component('BlockViewer', BlockViewer)

app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('AutoComplete', AutoComplete)
app.component('Avatar', Avatar)
app.component('AvatarGroup', AvatarGroup)
app.component('Badge', Badge)
app.component('Breadcrumb', Breadcrumb)
app.component('Button', Button)
app.component('Calendar', Calendar)
app.component('Card', Card)
app.component('Chart', Chart)
app.component('Carousel', Carousel)
app.component('Checkbox', Checkbox)
app.component('Chip', Chip)
app.component('Chips', Chips)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('ConfirmDialog', ConfirmDialog)
app.component('ConfirmPopup', ConfirmPopup)
app.component('ContextMenu', ContextMenu)
app.component('DataTable', DataTable)
app.component('DataView', DataView)
app.component('Dialog', Dialog)
app.component('Divider', Divider)
app.component('Dropdown', Dropdown)
app.component('DynamicDialog', DynamicDialog)
app.component('Fieldset', Fieldset)
app.component('FileUpload', FileUpload)
app.component('Image', Image)
app.component('InlineMessage', InlineMessage)
app.component('InputMask', InputMask)
app.component('InputNumber', InputNumber)
app.component('InputSwitch', InputSwitch)
app.component('InputText', InputText)
app.component('Listbox', Listbox)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
app.component('Message', Message)
app.component('MultiSelect', MultiSelect)
app.component('OverlayPanel', OverlayPanel)
app.component('Paginator', Paginator)
app.component('Panel', Panel)
app.component('Password', Password)
app.component('ProgressBar', ProgressBar)
app.component('ProgressSpinner', ProgressSpinner)
app.component('RadioButton', RadioButton)
app.component('Rating', Rating)
app.component('Row', Row)
app.component('SelectButton', SelectButton)
app.component('Slider', Slider)
app.component('Sidebar', Sidebar)
app.component('Skeleton', Skeleton)
app.component('SplitButton', SplitButton)
app.component('TabMenu', TabMenu)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Tag', Tag)
app.component('Textarea', Textarea)
app.component('Toast', Toast)
app.component('Toolbar', Toolbar)
app.component('ToggleButton', ToggleButton)
app.use(ToastService)
app.use(createVuestic({ config: vuesticGlobalConfig }))

if (import.meta.env.VITE_APP_GTM_ENABLED) {
  app.use(
    createGtm({
      id: import.meta.env.VITE_APP_GTM_KEY,
      debug: false,
      vueRouter: router,
    }),
  )
}


// listen notification
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../service-worker.js')
    .catch(() => {});
}

app.mount('#app')

if (localStorage.appLang == 'en')
  document.body.dir = "ltr"
else
  document.body.dir = "rtl"

// Scroll to top on route change
router.afterEach(() => {
  window.scrollTo(0, 0);
});

app.directive('can', () => {})
