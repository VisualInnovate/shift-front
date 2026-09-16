<template>
  <template v-for="(route, idx) in items" :key="idx">
    <va-dropdown
      v-if="isRouteVisible(route)"
      v-model="dropdownsValue[idx]"
      placement="right-start"
      prevent-overflow
      :offset="[1, 0]"
    >
      <template #anchor>
        <va-sidebar-item :active="isItemChildsActive(route)" :to="route.children ? undefined : { name: route.name }">
          <va-sidebar-item-content>
            <va-icon :name="route.meta.icon" class="va-sidebar-item__icon" />
            <va-icon
              v-if="route.children"
              class="more_icon"
              :name="dropdownsValue[idx] ? 'chevron_left' : 'chevron_right'"
            />
          </va-sidebar-item-content>
        </va-sidebar-item>
      </template>
      <div class="sidebar-item__children">
        <template v-for="(child, index) in route.children" :key="index">
          <va-sidebar-item v-if="isRouteVisible(child)" :active="isRouteActive(child)" :to="{ name: child.name }">
            <va-sidebar-item-content>
              <va-sidebar-item-title>
                {{ t(child.displayName) }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
        </template>
      </div>
    </va-dropdown>
  </template>
</template>

<script setup lang="ts">
  import { INavigationRoute } from '../NavigationRoutes'
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  withDefaults(
    defineProps<{
      items?: INavigationRoute[]
    }>(),
    {
      items: () => [],
    },
  )

  const dropdownsValue = ref([])
  const permissions = ref<string[]>([])

  try {
    const storedPermissions = localStorage.getItem('userPermissions')
    const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : []
    permissions.value = Array.isArray(parsedPermissions)
      ? parsedPermissions
          .map((permission: unknown) => {
            if (typeof permission === 'string') {
              return permission
            }

            if (permission && typeof permission === 'object') {
              const permissionRecord = permission as Record<string, unknown>
              const permissionField = ['name', 'permission', 'slug', 'key'].find(
                (field) => typeof permissionRecord[field] === 'string',
              )
              return permissionField ? (permissionRecord[permissionField] as string) : undefined
            }

            return undefined
          })
          .filter((permission): permission is string => Boolean(permission))
      : []
  } catch {
    permissions.value = []
  }

  // function isGroup(item: INavigationRoute) {
  //   return !!item.children
  // }

  function isRouteActive(item: INavigationRoute) {
    return item.name === useRoute().name
  }

  function isRouteVisible(route: INavigationRoute): boolean {
    const routePermissions = Array.isArray(route.show) ? route.show : [route.show]
    const hasRoutePermissions = route.requireAll
      ? routePermissions.every((permission) => permission && permissions.value.includes(permission))
      : routePermissions.some((permission) => permission && permissions.value.includes(permission))

    if (route.requireAll && route.show) {
      return hasRoutePermissions
    }

    if (route.children) {
      return route.children.some((child) => isRouteVisible(child))
    }

    return hasRoutePermissions
  }

  function isItemChildsActive(item: INavigationRoute): boolean {
    if (!item.children) {
      return false
    }

    const isCurrentItemActive = isRouteActive(item)

    let isChildActive = false
    if (item.children) {
      isChildActive = !!item.children.find((child) =>
        child.children ? isItemChildsActive(child) : isRouteActive(child),
      )
    }

    return isCurrentItemActive || isChildActive
  }
</script>

<style lang="scss">
  .sidebar-item {
    &__children {
      max-height: 60vh;
      overflow-y: auto;
      overflow-x: visible;
      width: 16rem;
      color: var(--va-gray);
      background: #cb2a2c;
      box-shadow: var(--va-box-shadow);
    }
  }

  .va-sidebar-item {
    &-content {
      position: relative;

      .more_icon {
        text-align: center;
        position: absolute;
        bottom: 0.5rem;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
  }
  .va-sidebar-item--active div {
    color: white !important;
  }
</style>
