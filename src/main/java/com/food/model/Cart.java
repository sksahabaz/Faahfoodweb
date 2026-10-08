	package com.food.model;
	
	import java.math.BigDecimal;
	import java.util.Collection;
	import java.util.LinkedHashMap;
	import java.util.Map;
	
	public class Cart {
	
		private int restaurantId;
	
		private Map<Integer, CartItem> items;
	
		// Default constructor
		public Cart() {
			this.restaurantId = 0;
			this.items = new LinkedHashMap<>();
		}
	
		public int getRestaurantId() {
			return restaurantId;
		}
	
		public void setRestaurantId(int restaurantId) {
			this.restaurantId = restaurantId;
		}
	
		public Map<Integer, CartItem> getItems() {
			return items;
		}
	
		public void setItems(Map<Integer, CartItem> items) {
			this.items = items;
		}
	
		public void addItem(Menu menu) {
	
			// First item decides the restaurant
			if (items.isEmpty()) {
				restaurantId = menu.getRestaurantId();
			}
	
			// Prevent items from different restaurants
			if (restaurantId != menu.getRestaurantId()) {
				throw new IllegalArgumentException("Cannot add items from different restaurants");
			}
	
			CartItem existingItem = items.get(menu.getMenuId());
	
			if (existingItem != null) {
				existingItem.setQuantity(existingItem.getQuantity() + 1);
			} else {
				CartItem newItem = new CartItem(menu, 1);
				items.put(menu.getMenuId(), newItem);
			}
		}
	
		public void updateQuantity(int menuId, int quantity) {
	
		    CartItem item = items.get(menuId);
	
		    if (item == null) {
		        return;
		    }
	
		    if (quantity <= 0) {
		        items.remove(menuId);
		    } else {
		        item.setQuantity(quantity);
		    }
		}
		public void removeItem(int menuId) {
			items.remove(menuId);
		}
	
		public void clear() {
			items.clear();
			restaurantId = 0;
		}
	
		public BigDecimal getTotal() {
	
			BigDecimal total = BigDecimal.ZERO;
	
			for (CartItem item : items.values()) {
				total = total.add(item.getSubtotal());
			}
	
			return total;
		}
	}